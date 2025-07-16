import { createContext, useCallback, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';
import useAuth from "../hooks/useAuth";
import type { Column, Board, Task, CreateTask } from "../type";

const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

function notImplemnted() {
  throw new Error("Not implemented yet...")
}

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  boardId: string | null;
  board?: Board;
  loading: boolean;
  error: string | null;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  createTask: (columnId: string, task: CreateTask, cb: (err: string | null, serverTask: Task) => void) => void;
  updateTask: (taskId: string, columnId: string, update: Partial<Task>) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string) => void;
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  boardId: null,
  columns: [],
  loading: false,
  error: null,
  setColumns: notImplemnted,
  createTask: notImplemnted,
  updateTask: notImplemnted,
  deleteTask: notImplemnted,
  moveTask: notImplemnted
});

export const SocketProvider: React.FC<{ children: React.ReactNode, boardId: string | null }> = ({ children, boardId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [board, setBoard] = useState<Board | undefined>(undefined)
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Task>>({});
  const authState = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!authState.user) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: authState.user.accessToken,
      }
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", newSocket.id);

      if (boardId) {
        joinBoard(newSocket, boardId);
      }
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("Socket disconnected:", reason);

      // Reconnect if server-initiated disconnect
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      setError("Connection failed. Trying to reconnect...");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [authState.user]);

  // Handle board ID changes
  useEffect(() => {
    if (socket && isConnected && boardId) {
      joinBoard(socket, boardId);
    }
  }, [boardId, socket, isConnected]);

  // Join board room and fetch initial data
  const joinBoard = (socket: Socket, boardId: string) => {
    setLoading(true);
    setError(null);

    socket.emit('joinBoard', boardId, (success: boolean) => {
      if (!success) {
        setError("Failed to join board");
        setLoading(false);
        return;
      }

      socket.emit("getBoard", boardId, (err: string | null, boardData: Board) => {
        if (err) {
          setError(err);
          setLoading(false);
          return;
        }

        setBoard(boardData);
        setColumns(boardData.columns);
        setLoading(false);
      });
    });
  };


  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (payload: { columnId: string; task: Task }) => {
      setColumns(prev => prev.map(col =>
        col._id === payload.columnId
          ? { ...col, tasks: [...col.tasks, payload.task] }
          : col
      ));
    };

    const handleTaskUpdated = (payload: {
      taskId: string;
      columnId: string;
      update: Partial<Task>
    }) => {
      setColumns(prev => prev.map(col =>
        col._id === payload.columnId
          ? {
            ...col,
            tasks: col.tasks.map(task =>
              task._id === payload.taskId ? { ...task, ...payload.update } : task
            )
          }
          : col
      ));
    };

    const handleTaskDeleted = (payload: { taskId: string; columnId: string }) => {
      setColumns(prev => prev.map(col =>
        col._id === payload.columnId
          ? { ...col, tasks: col.tasks.filter(t => t._id !== payload.taskId) }
          : col
      ));
    };

    socket.on('taskCreated', handleTaskCreated);
    socket.on('taskUpdated', handleTaskUpdated);
    socket.on('taskDeleted', handleTaskDeleted);

    return () => {
      socket.off('taskCreated', handleTaskCreated);
      socket.off('taskUpdated', handleTaskUpdated);
      socket.off('taskDeleted', handleTaskDeleted);
    };
  }, [socket]);


  // Create task with optimistic UI
  const createTask = useCallback((columnId: string, task: CreateTask, cb?: (err: string | null, serverTask: Task) => void) => {
    if (!boardId || !socket) return;

    const tempId = generateTempId();
    const optimisticTask: Task = { ...task, _id: tempId, assignedTo: null, createdAt: new Date() };

    // Optimistic update
    setColumns(prev => prev.map(col =>
      col._id === columnId
        ? { ...col, tasks: [...col.tasks, optimisticTask] }
        : col
    ));

    // Store original state for potential revert
    setOptimisticUpdates(prev => ({
      ...prev,
      [tempId]: optimisticTask
    }));

    // Emit to server
    socket.emit(
      'createTask',
      { boardId, columnId, ...task },
      (err: string | null, serverTask: Task) => {
        if (cb) cb(err, serverTask)
        if (err) {
          // Revert optimistic update
          setColumns(prev => prev.map(col =>
            col._id === columnId
              ? { ...col, tasks: col.tasks.filter(t => t._id !== tempId) }
              : col
          ));
          console.error('Create failed:', err);
        } else {
          // Replace optimistic ID with server ID
          setColumns(prev => prev.map(col =>
            col._id === columnId
              ? {
                ...col,
                tasks: col.tasks.map(t => t._id === tempId ? serverTask : t)
              }
              : col
          ));
        }
      }
    );
  }, [boardId, socket]);

  const updateTask = useCallback((
    taskId: string,
    columnId: string,
    update: Partial<Task>
  ) => {
    if (!boardId || !socket) return;

    // Save current state for potential revert
    const originalTask = columns
      .flatMap(c => c.tasks)
      .find(t => t._id === taskId);

    if (!originalTask) return;

    // Optimistic update
    setColumns(prev => prev.map(col =>
      col._id === columnId
        ? {
          ...col,
          tasks: col.tasks.map(task =>
            task._id === taskId ? { ...task, ...update } : task
          )
        }
        : col
    ));

    // Store for potential revert
    setOptimisticUpdates(prev => ({
      ...prev,
      [taskId]: originalTask
    }));

    // Emit to server
    socket.emit(
      'updateTask',
      { boardId, columnId, taskId, update },
      (err: string | null) => {
        if (err) {
          // Revert optimistic update
          setColumns(prev => prev.map(col =>
            col._id === columnId
              ? {
                ...col,
                tasks: col.tasks.map(task =>
                  task._id === taskId ? originalTask : task
                )
              }
              : col
          ));
          console.error('Update failed:', err);
        }
      }
    );
  }, [boardId, socket, columns]);

  // Delete task with optimistic UI
  const deleteTask = useCallback((taskId: string, columnId: string) => {
    if (!boardId || !socket) return;

    // Save current state for potential revert
    const originalTask = columns
      .flatMap(c => c.tasks)
      .find(t => t._id === taskId);

    if (!originalTask) return;

    // Optimistic update
    setColumns(prev => prev.map(col =>
      col._id === columnId
        ? { ...col, tasks: col.tasks.filter(t => t._id !== taskId) }
        : col
    ));

    // Store for potential revert
    setOptimisticUpdates(prev => ({
      ...prev,
      [taskId]: originalTask
    }));

    // Emit to server
    socket.emit(
      'deleteTask',
      { boardId, columnId, taskId },
      (err: string | null) => {
        if (err) {
          // Revert optimistic update
          setColumns(prev => prev.map(col =>
            col._id === columnId
              ? { ...col, tasks: [...col.tasks, originalTask] }
              : col
          ));
          console.error('Delete failed:', err);
        }
      }
    );
  }, [boardId, socket, columns]);

  // Move task between columns
  const moveTask = useCallback((
    taskId: string,
    fromColumnId: string,
    toColumnId: string
  ) => {
    if (!boardId || !socket) return;

    // Find the task
    const task = columns
      .flatMap(col => col.tasks)
      .find(t => t._id === taskId);

    if (!task) return;

    // Optimistic update
    setColumns(prev => {
      // Remove from source column
      const withoutTask = prev.map(col =>
        col._id === fromColumnId
          ? { ...col, tasks: col.tasks.filter(t => t._id !== taskId) }
          : col
      );

      // Add to target column
      return withoutTask.map(col =>
        col._id === toColumnId
          ? { ...col, tasks: [...col.tasks, task] }
          : col
      );
    });

    // Update on server
    socket.emit(
      'updateTask',
      {
        boardId,
        columnId: fromColumnId,
        taskId,
        update: { columnId: toColumnId }
      },
      (err: string | null) => {
        if (err) {
          // Revert optimistic update
          setColumns(prev => {
            // Remove from target column
            const withoutTask = prev.map(col =>
              col._id === toColumnId
                ? { ...col, tasks: col.tasks.filter(t => t._id !== taskId) }
                : col
            );

            // Add back to source column
            return withoutTask.map(col =>
              col._id === fromColumnId
                ? { ...col, tasks: [...col.tasks, task] }
                : col
            );
          });
          console.error('Move failed:', err);
        }
      }
    );
  }, [boardId, socket, columns]);


  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      boardId,
      board,
      columns,
      setColumns,
      loading,
      error,
      createTask,
      updateTask,
      deleteTask,
      moveTask
    }}>
      {children}
    </SocketContext.Provider>
  );
};