import { Task } from "../schemas/task.schema";
import { Document, model, Schema, Types } from "mongoose"

export interface ITask extends Task, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}


export const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, },
    priority: { type: String, required: true, enum: ['low', 'medium', 'high'], },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null, },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null, },
    position: { type: Number, required: false },
    version: { type: Number, required: true, default: 0 }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);




export const TaskModel = model<ITask>("Task", taskSchema)