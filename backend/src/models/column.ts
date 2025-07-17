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

columnSchema.pre("save", function (next) {
  // Case-insensitive duplicate title check
  const titleMap = new Map();
  for (const task of this.tasks) {
    const normalizedTitle = task.title.trim().toLowerCase();

    if (titleMap.has(normalizedTitle)) {
      return next(new Error(`Duplicate task title: ${task.title} in the same column`));
    }

    titleMap.set(normalizedTitle, true);
  }

  // Position duplicate check
  // const positions = this.tasks.map(t => t.position);
  // const uniquePositions = new Set(positions);

  // if (positions.length !== uniquePositions.size) {
  //   return next(new Error("Duplicate positions in the same column"));
  // }

  next();
});

export const ColumnModel = model<IColumn>("Column", columnSchema);