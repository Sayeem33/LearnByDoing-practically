import mongoose, { Document, Model, Schema } from 'mongoose';

export type AssignmentSourceType = 'lab' | 'tutorial';
export type AssignmentAudienceType = 'students' | 'classes' | 'mixed';

export interface IAssignment extends Document {
  title: string;
  description?: string;
  sourceType: AssignmentSourceType;
  sourceId: string;
  sourceName: string;
  sourceCategory: string;
  dueDate: Date;
  audienceType: AssignmentAudienceType;
  assignedStudentIds: string[];
  assignedClasses: string[];
  createdBy: string;
  createdByName: string;
  creatorRole: 'teacher' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    sourceType: {
      type: String,
      enum: ['lab', 'tutorial'],
      required: true,
    },
    sourceId: {
      type: String,
      required: true,
      index: true,
    },
    sourceName: {
      type: String,
      required: true,
    },
    sourceCategory: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    audienceType: {
      type: String,
      enum: ['students', 'classes', 'mixed'],
      required: true,
    },
    assignedStudentIds: {
      type: [String],
      default: [],
    },
    assignedClasses: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
    creatorRole: {
      type: String,
      enum: ['teacher', 'admin'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

AssignmentSchema.index({ createdBy: 1, dueDate: 1 });
AssignmentSchema.index({ sourceType: 1, sourceId: 1 });

const Assignment: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;
