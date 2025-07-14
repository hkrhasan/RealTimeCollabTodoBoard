// src/repositories/BaseRepository.ts
import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { IRepository } from '../types/repository';

export class BaseRepository<T extends Document> implements IRepository<T> {
  constructor(protected readonly model: Model<T>) { }

  async create(item: Partial<T>): Promise<T> {
    return this.model.create(item);
  }

  async find(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async update(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
