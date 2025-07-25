import { createContext, useCallback, useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';
import useAuth from "../hooks/useAuth";
import type { Column, Board, Task, CreateTask, UpdateTask, ConflictedTask } from "../type";
import { toast } from "sonner";
import { notImplemnted } from "../constants";
import type { IUser } from "./AuthContext";
import { usersAPI } from "../api/user";

const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;



type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
  boardId: string | null;
  board?: Board;
  loading: boolean;
  error: string | null;
  columns: Column[];
  users: IUser[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
  conflictedTask: ConflictedTask | null;
  setConflictedTask: React.Dispatch<React.SetStateAction<ConflictedTask | null>>
  createTask: (columnId: string, task: CreateTask, cb: (err: string | null, serverTask: Task) => void) => void;
  updateTask: (taskId: string, columnId: string, update: UpdateTask, cb: (err: string | null) => void) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  moveTask: (taskId: string, fromColumnId: string, toColumnId: string, cb?: (err: string | null) => void) => void;
  smartAssign: (columnId: string, taskId: string, version: number, cb?: (err: string | null) => void) => void
};

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  boardId: null,
  columns: [],
  loading: false,
  error: null,
  users: [],
  conflictedTask: null,
  setConflictedTask: notImplemnted,
  setColumns: notImplemnted,
  createTask: notImplemnted,
  updateTask: notImplemnted,
  deleteTask: notImplemnted,
  moveTask: notImplemnted,
  smartAssign: notImplemnted,
});

export const SocketProvider: React.FC<{ children: React.ReactNode, boardId: string | null }> = ({ children, boardId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [board, setBoard] = useState<Board | undefined>(undefined)
  const [columns, setColumns] = useState<Column[]>([])
  const [conflictedTask, setConflictedTask] = useState<ConflictedTask | null>(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Record<string, Task>>({});
  const authState = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (!authState.user) return;

    usersAPI.getUsers().then(res => {
      setUsers(res.data || []);
    });

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
    if (!socket || !users.length || !columns) return;

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
      console.log("receive update task", payload, users)
      let assignedTo: any = payload?.update?.assignedTo;
      if (assignedTo) {
        const user = users.find(u => u._id === assignedTo);
        if (!user) {
          toast.error("someting went wrong refresh the page")
          return;
        }
        assignedTo = user;
      }


      setColumns(prev => prev.map(col =>
        col._id === payload.columnId
          ? {
            ...col,
            tasks: col.tasks.map(task =>
              task._id === payload.taskId ? { ...task, ...payload.update, ...(assignedTo && { assignedTo }) } : task
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

    const handleTaskMoved = (payload: { taskId: string; sourceColumnId: string; targetColumnId: string }) => {
      setColumns(prev => {
        const task = prev.flatMap(col => col.tasks).find(t => t._id === payload.taskId)
        if (!task) return prev;

        // Remove from source column
        const withoutTask = prev.map(col =>
          col._id === payload.sourceColumnId
            ? { ...col, tasks: col.tasks.filter(t => t._id !== payload.taskId) }
            : col
        );

        // Add to target column
        return withoutTask.map(col =>
          col._id === payload.targetColumnId
            ? { ...col, tasks: [...col.tasks, task] }
            : col
        );
      });
    }

    const handleTaskConflict = (payload: Task & { columnId: string; boardId: string }) => {
      const { columnId, boardId, ...task } = payload;
      const originalTask = optimisticUpdates[task._id];

      if (!originalTask) return;

      const conflictedFields = Object.keys(originalTask).filter((k) => {
        if (k === 'version') return false
        const localValue = originalTask[k as keyof typeof originalTask];
        const serverValue = task[k as keyof typeof task];
        return JSON.stringify(localValue) !== JSON.stringify(serverValue)
      }) || []

      if (!originalTask) return;
      setConflictedTask({
        local: originalTask,
        server: task,
        columnId,
        conflictedFields,
      })
    }

    socket.on('taskCreated', handleTaskCreated);
    socket.on('taskUpdated', handleTaskUpdated);
    socket.on('taskDeleted', handleTaskDeleted);
    socket.on('taskMoved', handleTaskMoved);
    socket.on('taskConflicted', handleTaskConflict);

    return () => {
      socket.off('taskCreated', handleTaskCreated);
      socket.off('taskUpdated', handleTaskUpdated);
      socket.off('taskDeleted', handleTaskDeleted);
      socket.off('taskMoved', handleTaskMoved);
      socket.off('taskConflicted', handleTaskConflict);
    };
  }, [socket, users, columns]);


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
    update: UpdateTask,
    cb: (err: string | null) => void
  ) => {
    if (!boardId || !socket) return;

    // Save current state for potential revert
    const originalTask = columns
      .flatMap(c => c.tasks)
      .find(t => t._id === taskId);

    if (!originalTask) return;

    const lastVersion = update.version || originalTask.version;

    console.log("update lastVersion >>", lastVersion)
    // Optimistic update
    setColumns(prev => prev.map(col =>
      col._id === columnId
        ? {
          ...col,
          tasks: col.tasks.map(task =>
            task._id === taskId ? { ...task, ...update, version: lastVersion + 1, overwrite: undefined } : task
          )
        }
        : col
    ));

    // Store for potential revert
    setOptimisticUpdates(prev => ({
      ...prev,
      [taskId]: originalTask
    }));

    let assignedTo: any = update.assignedTo;
    if (assignedTo) {
      assignedTo = assignedTo._id
    }

    // Emit to server
    socket.emit(
      'updateTask',
      { boardId, columnId, taskId, ...update, assignedTo, version: lastVersion },
      (err: string | null) => {
        cb(err);
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

  const smartAssignTask = useCallback((columnId: string, taskId: string, version: number, cb?: (err: string | null) => void) => {
    if (!boardId || !socket) return;

    // Emit to server
    socket.emit(
      'assignSmart',
      { boardId, columnId, taskId, version },
      (err: string | null) => {
        if (cb) cb(err);
        if (err) {
          console.error('Assign failed:', err);
        }
      }
    );

  }, [boardId, socket])

  // Delete task with optimistic UI
  const deleteTask = useCallback((taskId: string, columnId: string) => {
    if (!boardId || !socket) return;

    // Save current state for potential revert
    const tasks = columns
      .flatMap(c => c.tasks)
    const originalTaskIndex = tasks.findIndex(t => t._id === taskId)

    const originalTask = tasks[originalTaskIndex]

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
          setColumns(prev => prev.map(col => {
            if (col._id !== columnId) return col;
            const tasks = [...col.tasks];
            tasks.splice(originalTaskIndex, 0, originalTask)
            return { ...col, tasks }
          }
          ));
          console.error('Delete failed:', err);
          toast.error(err)
        }
      }
    );
  }, [boardId, socket, columns]);

  // Move task between columns
  const moveTask = useCallback((
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    cb?: (err: string | null) => void
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
      'moveTask',
      {
        boardId,
        sourceColumnId: fromColumnId,
        taskId,
        targetColumnId: toColumnId
      },
      (err: string | null) => {
        if (cb) cb(err)
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
      users,
      conflictedTask,
      setConflictedTask,
      createTask,
      updateTask,
      deleteTask,
      moveTask,
      smartAssign: smartAssignTask,
    }}>
      {children}
    </SocketContext.Provider>
  );
};