import mongoose, { Document, Schema } from 'mongoose';

// Tutorial Chapter Interface
interface TutorialChapter {
  chapterNumber: number;
  title: string;
  content: string;
  keyPoints: string[];
  visualDescription?: string;
  formula?: string;
  examples?: Array<{
    title: string;
    description: string;
    calculation?: string;
  }>;
}

// Tutorial Interface
export interface ITutorial extends Document {
  experimentId: string; // freefall, projectilemotion, pendulum, collision, acidbase, titration, llm, agenticai, rag
  experimentName: string;
  category: 'physics' | 'chemistry' | 'technology';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  objectives: string[];
  prerequisites?: string[];
  chapters: TutorialChapter[];
  relatedTopics?: string[];
  references?: Array<{
    title: string;
    url: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TutorialChapterSchema = new Schema({
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  keyPoints: [String],
  visualDescription: String,
  formula: String,
  examples: [
    {
      title: String,
      description: String,
      calculation: String,
    },
  ],
});

const TutorialSchema = new Schema<ITutorial>(
  {
    experimentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    experimentName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['physics', 'chemistry', 'technology'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    duration: {
      type: Number,
      required: true,
    },
    objectives: [String],
    prerequisites: [String],
    chapters: [TutorialChapterSchema],
    relatedTopics: [String],
    references: [
      {
        title: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Tutorial ||
  mongoose.model<ITutorial>('Tutorial', TutorialSchema);
