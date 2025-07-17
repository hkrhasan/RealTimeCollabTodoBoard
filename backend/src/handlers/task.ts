import { Socket } from "socket.io"
import { ITask } from "../models"
import { TaskCreateWithoutCreatedBy, taskCreateWithoutCreatedBySchema, TaskDelete, taskDeleteSchema, TaskMove, taskMoveSchema, TaskUpdate, taskUpdateSchema } from "../schemas/task.schema"
import columnRepository from "../repositories/column.repository";
import { object, ZodError } from "zod";
import taskRepository from "../repositories/task.repository";

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
  try {
    const { boardId, columnId, taskId, ...taskDto } = taskUpdateSchema.parse(payload);

    if (!Object.entries(taskDto).length) {
      cb("there is no updte")
      return
    }

    await columnRepository.updateTask({ ...taskDto, columnId, taskId })

    socket.to(boardId).emit('taskUpdated', {
      taskId,
      columnId,
      update: taskDto,
    })

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

export default function (socket: Socket) {
  socket.on('createTask', (payload, cb) => createTaskHandler(socket, payload, cb))

  socket.on('deleteTask', (payload, cb) => deleteTaskHandler(socket, payload, cb)
  )

  socket.on('moveTask', (payload, cb) => moveTaskHandler(socket, payload, cb))
  socket.on('updateTask', (payload, cb) => updateTaskHandler(socket, payload, cb))
}