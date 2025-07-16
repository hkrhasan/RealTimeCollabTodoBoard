import { Action } from "../schemas/action.schema";
import { Document, model, Schema, Types } from "mongoose"



export interface IAction extends Action, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}


export const actionSchema = new Schema<IAction>(
  {
    type: { type: String, required: true, enum: ['add', 'edit', 'delete', 'assign', 'drag-drop'] },
    who: { type: Schema.Types.ObjectId, ref: 'User', default: null, },
    what: { type: Schema.Types.ObjectId, ref: 'Task', default: null, },
  },
  {
    timestamps: true,
    versionKey: false
  }
)


export const ActionModel = model<IAction>("Action", actionSchema)