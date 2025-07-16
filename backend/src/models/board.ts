import { model, Schema, Types, Document } from "mongoose";
import { Board } from "../schemas/board.schema";



export interface IBoard extends Board, Document {
  _id: Types.ObjectId; // Explicitly include _id
  createdAt: Date;
  updatedAt: Date;
}


const boardSchema = new Schema<IBoard>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    columns: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Column',
        required: true,
      },
    ],
    actions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Action',
      }
    ]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const BoardModel = model<IBoard>("Board", boardSchema)