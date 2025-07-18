import { Socket } from "socket.io"
import { ITask } from "../models"
import { TaskCreateWithoutCreatedBy, taskCreateWithoutCreatedBySchema, TaskDelete, taskDeleteSchema, TaskMove, taskMoveSchema, TaskSmartAssign, taskSmartAssignSchema, TaskUpdate, taskUpdateSchema } from "../schemas/task.schema"
import columnRepository from "../repositories/column.repository";
import { ZodError } from "zod";
import boardRepository from "../repositories/board.repository";
import actionRepository from "../repositories/action.repository";

type ErrorCb = (err: string | null) => void;

export const createTaskHandler = async (socket: Socket, payload: TaskCreateWithoutCreatedBy, cb: (err: string | null, task?: ITask) => void) => {
  try {

    const { boardId, ...dto } = taskCreateWithoutCreatedBySchema.parse(payload);

    const createdTask = await columnRepository.addTask({ ...dto, createdBy: socket.data.user.sub })

    socket.to(boardId).emit('taskCreated', {
      columnId: payload.columnId,
      task: createdTask
    });

    cb(null, createdTask);

  } catch (error) {
    console.error(error);
    let message = (error as Error).message

    if (error instanceof ZodError) {
      message = JSON.parse(error.message);
    }

    if ((error as Error).name === 'MongoServerError' && (error as any).code === 11000) {
      message = "title already in use"
    }

    cb(message)
  }
}


export const deleteTaskHandler = async (socket: Socket, payload: TaskDelete, cb: ErrorCb) => {
  try {
    const { taskId, boardId, columnId } = taskDeleteSchema.parse(payload);

    const { column, taskIndex, task } = await columnRepository.findColumnAndTaskById(columnId, taskId);

    if (task?.createdBy?.toString() !== socket.data.user.sub) {
      throw new Error("Unauthorized")
    }

    if (task?.assignedTo) {
      boardRepository.updateWorkloadCache(boardId, task.assignedTo, -1)
    }

    // remove task
    column.tasks.splice(taskIndex, 1);
    await column.save();

    socket.to(boardId).emit('taskDeleted', {
      columnId,
      taskId,
    })


    cb(null)

  } catch (error) {
    console.error(error);
    let message = (error as Error).message

    if (error instanceof ZodError) {
      message = JSON.parse(error.message);
    }

    cb(message)
  }
}



export const moveTaskHandler = async (socket: Socket, payload: TaskMove, cb: ErrorCb) => {
  console.log("Moved Task payload: ", payload)
  try {
    const { taskId, sourceColumnId, targetColumnId, boardId } = taskMoveSchema.parse(payload);

    // 1. Remove from source column
    const sourceData = await columnRepository.findColumnAndTaskById(sourceColumnId, taskId);
    const [task] = sourceData.column.tasks.splice(sourceData.taskIndex, 1);
    await sourceData.column.save();

    // 2. Add to target column at position
    const targetColumn = await columnRepository.findById(targetColumnId);
    if (!targetColumn) throw new Error('Target column not found');

    targetColumn.tasks.push(task as ITask)
    await targetColumn.save();

    socket.to(boardId).emit('taskMoved', {
      taskId,
      sourceColumnId,
      targetColumnId,
    })

    cb(null);
  } catch (error) {
    console.error("MovedTask error: ", error);
    let message = (error as Error).message

    if (error instanceof ZodError) {
      message = JSON.parse(error.message);
    }

    cb(message)
  }
}

export const updateTaskHandler = async (socket: Socket, payload: TaskUpdate, cb: ErrorCb) => {
  console.log("Update Task payload:- ", payload)
  try {
    const { boardId, columnId, taskId, broadCast, ...taskDto } = taskUpdateSchema.parse(payload);

    if (!Object.entries(taskDto).length) {
      cb("there is no updte")
      return
    }

    await columnRepository.updateTask({ ...taskDto, columnId, taskId }, (assignees) => {
      if (assignees.new) boardRepository.updateWorkloadCache(boardId, assignees.new, 1)
      if (assignees.old) boardRepository.updateWorkloadCache(boardId, assignees.old, -1)
    })

    const returnPayload = {
      taskId,
      columnId,
      update: taskDto,
    }

    if (broadCast) {
      // 1) send to the socket that triggered it
      socket.emit("taskUpdated", returnPayload);
      // 2) send to everyone else in the room
      socket.to(boardId).emit("taskUpdated", returnPayload);
    } else {
      // old behavior: everyone except the sender
      socket.to(boardId).emit("taskUpdated", returnPayload);
    }
    cb(null)
  } catch (error) {
    console.error("MovedTask error: ", error);
    let message = (error as Error).message

    if (error instanceof ZodError) {
      message = JSON.parse(error.message);
    }

    cb(message)
  }
}

export const assignSmartHandler = async (socket: Socket, payload: TaskSmartAssign, cb: ErrorCb) => {
  console.log({ payload })
  try {
    const parsedPaylod = taskSmartAssignSchema.parse(payload);


    const optimalUserId = await boardRepository.findOptimalAssignee(parsedPaylod.boardId);
    console.log("Optimal user :- ", optimalUserId)

    updateTaskHandler(socket, { ...parsedPaylod, assignedTo: optimalUserId, broadCast: true, }, cb)
  } catch (error) {
    console.error("AssignTask error: ", error);
    let message = (error as Error).message

    if (error instanceof ZodError) {
      message = JSON.parse(error.message);
    }

    cb(message)
  }
}



export default function (socket: Socket) {
  const userId = socket.data.user._id;
  socket.on('createTask', (payload, cb) => createTaskHandler(socket, payload, (err, task) => {
    cb(err, task)
    if (!err && task) {
      actionRepository.create({
        type: 'add',
        who: userId,
        what: task._id.toString(),
      })
    }
  }))
  socket.on('deleteTask', (payload, cb) => deleteTaskHandler(socket, payload, (err) => {
    cb(err);
    if (!err) {
      actionRepository.create({
        type: 'delete',
        who: userId,
        what: payload.taskId
      })
    }
  })
  )
  socket.on('moveTask', (payload, cb) => moveTaskHandler(socket, payload, (err) => {
    cb(err);
    if (!err) {
      actionRepository.create({
        type: 'drag-drop',
        who: userId,
        what: payload.taskId,
      })
    }
  }))
  socket.on('updateTask', (payload, cb) => updateTaskHandler(socket, payload, (err) => {
    cb(err)
    if (!err) {
      actionRepository.create({
        type: 'edit',
        who: userId,
        what: payload.taskId,
      })
    }
  }))
  socket.on('assignSmart', (payload, cb) => assignSmartHandler(socket, payload, (err) => {
    cb(err)
    if (!err) {
      actionRepository.create({
        type: 'assign',
        who: userId,
        what: payload.payload,
      })
    }
  }))
}


