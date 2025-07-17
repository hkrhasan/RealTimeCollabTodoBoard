import { populate } from "dotenv";
import { IBoard, BoardModel, IColumn } from "../models";
import { BaseRepository } from "./base.repository";
import userRepository from "./user.repository";
import { Types } from "mongoose";

class BoardRepository extends BaseRepository<IBoard> {
  boardWorkloadCache = new Map<string, Map<string, number>>();

  constructor() {
    super(BoardModel);
  }

  async findByIdWithColumnAndTask(id: string): Promise<IBoard | null> {
    return this.model.findById(id).populate({
      path: 'columns',
      populate: {
        path: 'tasks',
        populate: {
          path: 'assignedTo',
          select: '_id username',             // only bring back the username
          model: 'User',
        }
      }
    }).lean()
  }

  async exists(id: string) {
    return this.model.exists({ _id: id })
  }


  async calculateBoardWorkload(boardId: string) {
    const board = await this.findByIdWithColumnAndTask(boardId)

    if (!board) throw new Error("Board not found")

    const users = await userRepository.find();

    // Initialize count map
    const taskCounts = new Map<string, number>();
    users.forEach((u) => {
      taskCounts.set(u._id.toString(), 0)
    })

    // Count tasks per user
    board.columns.forEach((c: any) => {
      c.tasks.forEach((t: any) => {
        const userId = t.assignedTo ? t.assignedTo._id.toString() : null;
        if (taskCounts.has(userId)) {
          taskCounts.set(userId, taskCounts.get(userId)! + 1);
        }
      })
    })

    // Update cache
    this.boardWorkloadCache.set(boardId, taskCounts);

    // Find user with minimum tasks
    let minCount = Infinity;
    let optimalUserId: string | null = null;

    taskCounts.forEach((count, userId) => {
      if (count < minCount) {
        minCount = count;
        optimalUserId = userId;
      }
    });

    return optimalUserId ? optimalUserId : null;
  }

  findLeastBusyFromCache(boardId: string) {
    const boardCache = this.boardWorkloadCache.get(boardId);
    if (!boardCache || boardCache.size === 0) return null;

    let minCount = Infinity;
    let candidateId: string | null = null;

    boardCache.forEach((count, userId) => {
      if (count < minCount) {
        minCount = count;
        candidateId = userId;
      }
    });

    return candidateId;
  }

  async findOptimalAssignee(boardId: string): Promise<string | null> {
    // 1. Try cache first
    const cachedUserId = this.findLeastBusyFromCache(boardId);
    if (cachedUserId) return cachedUserId;

    // 2. Cache miss - calculate workload
    return this.calculateBoardWorkload(boardId);
  }


  updateWorkloadCache(
    boardId: string,
    userId: string,
    change: number
  ): void {
    const boardCache = this.boardWorkloadCache.get(boardId) || new Map<string, number>();
    const currentCount = boardCache.get(userId) || 0;
    boardCache.set(userId, Math.max(0, currentCount + change));
    this.boardWorkloadCache.set(boardId, boardCache);
  }
}


export default new BoardRepository();