// src/repositories/BaseRepository.ts
import { Model, Document, FilterQuery, UpdateQuery, SortOrder } from 'mongoose';
import { IRepository } from '../types/repository';

export interface FindOptions {
  select?: string;
  limit?: number;
  skip?: number;
  sort?: Record<string, SortOrder>;
}


export class BaseRepository<T extends Document> implements IRepository<T> {
  constructor(protected readonly model: Model<T>) { }

  async create(item: Partial<T>): Promise<T> {
    return this.model.create(item);
  }

  async find(
    filter: FilterQuery<T> = {},
    options: FindOptions = {}
  ): Promise<T[]> {
    let query = this.model.find(filter);

    if (options.sort) {
      query = query.sort(options.sort);
    }
    if (options.skip !== undefined) {
      query = query.skip(options.skip);
    }
    if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }

    return query.exec();
  }

  async findById(id: string, options: FindOptions = {}): Promise<T | null> {
    let query = this.model.findById(id);

    if (options.select) {
      query.select(options.select)
    }

    return query.exec();
  }

  async update(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
