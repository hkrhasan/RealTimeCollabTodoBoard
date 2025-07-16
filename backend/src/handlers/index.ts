import { Socket } from "socket.io";
import boardHandler from './board'
import taskHandler from './task'


export const registerHandlers = (socket: Socket) => {
  boardHandler(socket);
  taskHandler(socket);
}