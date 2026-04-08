import mongoose, { Document, Model, Schema } from 'mongoose';

// Physics Object Interface
interface PhysicsObject {
  id: string;
  type: 'ball' | 'box' | 'ramp' | 'spring' | 'pendulum' | 'cannon';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  mass?: number;
  velocity?: { x: number; y: number };
  angle?: number;
  color?: string;
  friction?: number;
  restitution?: number;
}

// Chemistry Setup Interface
interface ChemistrySetup {
  beakers: Array<{
    id: string;
    x: number;
    y: number;
    contents: string[];
    temperature: number;
  }>;
  chemicals: string[];
}

// Data Point Interface
interface DataPoint {
  time: number;
  [key: string]: number;
}

// Experiment State Interface
interface ExperimentState {
  objects?: PhysicsObject[];
  chemistry?: ChemistrySetup;
  dataPoints?: DataPoint[];
  graphConfig?: {
    xAxis: string;
    yAxis: string;
    title: string;
  };
  [key: string]: any;
}

export interface ExperimentReview {
  status: 'not_reviewed' | 'pending_review' | 'approved' | 'changes_requested';
  feedback?: string;
  reviewedBy?: string;
  reviewerRole?: 'teacher' | 'admin' | '';
  reviewedAt?: Date | null;
}

export interface IExperiment extends Document {
  userId: string;
  title: string;
  description?: string;
  category: 'physics' | 'chemistry' | 'electronics';
  experimentType: string;
  state: ExperimentState;
  labReport?: string;
  review: ExperimentReview;
  isTemplate: boolean;
  templateCreatedBy?: mongoose.Types.ObjectId;
  tags?: string[];
  status: 'draft' | 'completed' | 'submitted';
  sharedWith?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ExperimentSchema = new Schema<IExperiment>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      enum: ['physics', 'chemistry', 'electronics'],
      required: true,
      index: true,
    },
    experimentType: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    labReport: {
      type: String,
      default: '',
    },
    review: {
      status: {
        type: String,
        enum: ['not_reviewed', 'pending_review', 'approved', 'changes_requested'],
        default: 'not_reviewed',
      },
      feedback: {
        type: String,
        default: '',
      },
      reviewedBy: {
        type: String,
        default: '',
      },
      reviewerRole: {
        type: String,
        enum: ['teacher', 'admin', ''],
        default: '',
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
    },
    isTemplate: {
      type: Boolean,
      default: false,
      index: true,
    },
    templateCreatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'completed', 'submitted'],
      default: 'draft',
    },
    sharedWith: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for better query performance
ExperimentSchema.index({ userId: 1, category: 1 });
ExperimentSchema.index({ userId: 1, status: 1 });
ExperimentSchema.index({ isTemplate: 1, category: 1 });

// Virtual for getting the experiment age
ExperimentSchema.virtual('age').get(function () {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Prevent model recompilation in development
const Experiment: Model<IExperiment> =
  mongoose.models.Experiment || mongoose.model<IExperiment>('Experiment', ExperimentSchema);

export default Experiment;
