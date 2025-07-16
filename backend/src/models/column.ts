import { Schema, model, Document, Types } from "mongoose";
import { Column } from "../schemas/column.schema";
import { taskSchema } from "./task";


export interface IColumn extends Column, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const columnSchema = new Schema<IColumn>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
  },
  tasks: {
    type: [taskSchema],
    default: [],
  },
}, {
  timestamps: true,
  versionKey: false,
})

export const ColumnModel = model<IColumn>("Column", columnSchema);