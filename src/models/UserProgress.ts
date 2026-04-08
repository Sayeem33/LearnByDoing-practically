import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICompletedStep {
  stepId: string;
  title: string;
  kind: 'tutorial' | 'lab' | 'achievement' | 'system';
  itemId?: string;
  itemType?: string;
  category?: string;
  completedAt: Date;
}

export interface IAchievement {
  achievementId: string;
  title: string;
  description: string;
  kind: 'tutorial' | 'lab' | 'progress';
  icon?: string;
  earnedAt: Date;
}

export interface ITutorialProgress {
  tutorialId: string;
  experimentName: string;
  category: 'physics' | 'chemistry' | 'technology';
  totalChapters: number;
  completedChapters: number[];
  lastChapter: number;
  completionPercent: number;
  startedAt: Date;
  lastViewedAt: Date;
  completedAt?: Date | null;
}

export interface ILabProgress {
  experimentType: string;
  experimentName: string;
  category: 'physics' | 'chemistry' | 'technology';
  savedExperimentId?: string;
  status: 'draft' | 'completed' | 'submitted';
  reportSaved: boolean;
  savesCount: number;
  completionPercent: number;
  startedAt: Date;
  lastWorkedAt: Date;
  completedAt?: Date | null;
  submittedAt?: Date | null;
}

export interface IProgressStats {
  completedStepsCount: number;
  achievementsCount: number;
  completedTutorialsCount: number;
  tutorialsInProgressCount: number;
  completedLabsCount: number;
  submittedLabsCount: number;
  tutorialCompletionRate: number;
  labCompletionRate: number;
}

export interface IUserProgress extends Document {
  userId: string;
  completedSteps: ICompletedStep[];
  achievements: IAchievement[];
  tutorialProgress: ITutorialProgress[];
  labProgress: ILabProgress[];
  stats: IProgressStats;
  createdAt: Date;
  updatedAt: Date;
}

const CompletedStepSchema = new Schema<ICompletedStep>(
  {
    stepId: { type: String, required: true },
    title: { type: String, required: true },
    kind: {
      type: String,
      enum: ['tutorial', 'lab', 'achievement', 'system'],
      required: true,
    },
    itemId: String,
    itemType: String,
    category: String,
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AchievementSchema = new Schema<IAchievement>(
  {
    achievementId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    kind: {
      type: String,
      enum: ['tutorial', 'lab', 'progress'],
      required: true,
    },
    icon: String,
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TutorialProgressSchema = new Schema<ITutorialProgress>(
  {
    tutorialId: { type: String, required: true },
    experimentName: { type: String, required: true },
    category: {
      type: String,
      enum: ['physics', 'chemistry', 'technology'],
      required: true,
    },
    totalChapters: { type: Number, required: true, default: 0 },
    completedChapters: { type: [Number], default: [] },
    lastChapter: { type: Number, default: 1 },
    completionPercent: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    lastViewedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const LabProgressSchema = new Schema<ILabProgress>(
  {
    experimentType: { type: String, required: true },
    experimentName: { type: String, required: true },
    category: {
      type: String,
      enum: ['physics', 'chemistry', 'technology'],
      required: true,
    },
    savedExperimentId: String,
    status: {
      type: String,
      enum: ['draft', 'completed', 'submitted'],
      default: 'draft',
    },
    reportSaved: { type: Boolean, default: false },
    savesCount: { type: Number, default: 0 },
    completionPercent: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    lastWorkedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
  },
  { _id: false }
);

const ProgressStatsSchema = new Schema<IProgressStats>(
  {
    completedStepsCount: { type: Number, default: 0 },
    achievementsCount: { type: Number, default: 0 },
    completedTutorialsCount: { type: Number, default: 0 },
    tutorialsInProgressCount: { type: Number, default: 0 },
    completedLabsCount: { type: Number, default: 0 },
    submittedLabsCount: { type: Number, default: 0 },
    tutorialCompletionRate: { type: Number, default: 0 },
    labCompletionRate: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserProgressSchema = new Schema<IUserProgress>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    completedSteps: {
      type: [CompletedStepSchema],
      default: [],
    },
    achievements: {
      type: [AchievementSchema],
      default: [],
    },
    tutorialProgress: {
      type: [TutorialProgressSchema],
      default: [],
    },
    labProgress: {
      type: [LabProgressSchema],
      default: [],
    },
    stats: {
      type: ProgressStatsSchema,
      default: () => ({
        completedStepsCount: 0,
        achievementsCount: 0,
        completedTutorialsCount: 0,
        tutorialsInProgressCount: 0,
        completedLabsCount: 0,
        submittedLabsCount: 0,
        tutorialCompletionRate: 0,
        labCompletionRate: 0,
      }),
    },
  },
  {
    timestamps: true,
  }
);

const UserProgress: Model<IUserProgress> =
  mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);

export default UserProgress;
