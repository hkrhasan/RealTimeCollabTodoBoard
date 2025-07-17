import { Socket } from "socket.io";
import boardRepository from "../repositories/board.repository";

// export const boardWorkloadCache = new Map<string, Map<string, number>>();

const joinBoardHandler = async (socket: Socket, boardId: string, cb: (success: boolean) => void) => {
  try {
    const board = await boardRepository.exists(boardId);
    if (!board) throw new Error('Board not found');

    socket.join(boardId);
    console.log(`${socket.id} joined board ${boardId}`)
    cb(true);
  } catch (error) {
    console.error(`Join error: ${(error as Error).message}`);
    cb(false)
  }
}

const getBoardhandler = async (boardId: string, cb: (err: string | null, board?: any) => void) => {
  try {
    const board = await boardRepository.findByIdWithColumnAndTask(boardId);
    if (!board) throw new Error("Board not found");
    cb(null, board)
  } catch (error) {
    console.error(error)
    cb((error as Error).message);
  }
}


export default function (socket: Socket) {
  socket.on("joinBoard", (boardId, cb) => joinBoardHandler(socket, boardId, cb))
  socket.on("getBoard", (boardId, cb) => getBoardhandler(boardId, cb))
}

