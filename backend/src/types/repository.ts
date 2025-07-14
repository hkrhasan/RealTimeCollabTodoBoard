import { Document, FilterQuery, UpdateQuery } from 'mongoose';

export interface IRepository<T extends Document> {
  create(item: Partial<T>): Promise<T>;
  find(filter?: FilterQuery<T>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  update(id: string, update: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<T | null>;
}
