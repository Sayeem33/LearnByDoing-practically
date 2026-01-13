import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAchievement extends Document {
  title: string;
  description?: string;
  points?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Achievement: Model<IAchievement> = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);

export default Achievement;
