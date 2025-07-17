import { useContext } from "react"
import { SocketContext } from "../contexts/SocketContext"




const useSocket = () => {
  const { socket, boardId, ...state } = useContext(SocketContext);


  // const createTask = async (columnId: string, task: Omit<Task, '_id' | 'assignedTo' | 'createdAt'>, cb: (err: string | null, serverTask: Task) => void) => {
  //   socket?.emit("createTask", { boardId, columnId, ...task }, cb)
  // }


  return { boardId, socket, ...state }
}

export default useSocket;