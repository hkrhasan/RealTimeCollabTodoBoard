import { Schema, model, Document, Types } from "mongoose";
import * as argon2 from "argon2";
import { User, userZodSchema } from "../schemas/user.schema";


export interface IUser extends User, Document {
  _id: Types.ObjectId; // Explicitly include _id
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  compareRTHash(refreshToken: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, minlength: 1, maxlength: 50 },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true, minlength: 8, maxlength: 100 },
  rtHash: { type: String, required: false },
}, {
  timestamps: true,
  versionKey: false,
});


userSchema.pre("save", async function (next) {
  try {
    await userZodSchema.parseAsync(this.toObject());
    this.password = await argon2.hash(this.password);

    if (this.rtHash) {
      this.rtHash = await argon2.hash(this.rtHash);
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  try {
    let rtHash = this.get('rtHash')
    if (rtHash) {
      rtHash = await argon2.hash(rtHash);
      this.set('rtHash', rtHash);
    }
  } catch (error) {
    next(error as Error);
  }
})

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return argon2.verify(this.password, candidatePassword);
};

userSchema.methods.compareRTHash = async function (refreshToken: string): Promise<boolean> {
  return this.rtHash && argon2.verify(this.rtHash, refreshToken)
}

export const UserModel = model<IUser>("User", userSchema);

