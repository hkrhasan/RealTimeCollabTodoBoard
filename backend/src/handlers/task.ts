import { Socket } from "socket.io"
import { ITask } from "../models"
import { taskCreateSchema, TaskCreateWithoutCreatedBy, taskCreateWithoutCreatedBySchema } from "../schemas/task.schema"
import columnRepository from "../repositories/column.repository";
import { ZodError } from "zod";

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



export default function (socket: Socket) {
  socket.on('createTask', (payload, cb) => {
    createTaskHandler(socket, payload, cb)
  })

  socket.on('updateTask', (payload, cb) => {

  })
}