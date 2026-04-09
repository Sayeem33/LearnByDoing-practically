import mongoose, { Document, Model, Schema } from 'mongoose';

type ConceptCategory = 'physics' | 'chemistry' | 'math';
type ControlKind = 'range' | 'number' | 'select' | 'toggle';

interface ConceptControlOption {
  label: string;
  value: string;
}

interface ConceptControl {
  key: string;
  label: string;
  kind: ControlKind;
  unit?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: ConceptControlOption[];
}

interface ConceptFormula {
  key: string;
  label: string;
  expression: string;
  description: string;
}

interface ConceptChart {
  key: string;
  title: string;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
}

interface ConceptTutorialChapter {
  chapterNumber: number;
  title: string;
  content: string;
  keyPoints: string[];
}

interface ConceptValidationRule {
  key: string;
  label: string;
  description: string;
  implemented: boolean;
}

export interface IConceptDefinition extends Document {
  conceptId: string;
  name: string;
  category: ConceptCategory;
  description: string;
  theory: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  objectives: string[];
  controls: ConceptControl[];
  formulas: ConceptFormula[];
  charts: ConceptChart[];
  tutorialChapters: ConceptTutorialChapter[];
  validationRules: ConceptValidationRule[];
  defaultState: Record<string, any>;
  createdBy: string;
  createdByName: string;
  creatorRole: 'teacher' | 'admin';
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ControlOptionSchema = new Schema(
  {
    label: String,
    value: String,
  },
  { _id: false }
);

const ControlSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    kind: {
      type: String,
      enum: ['range', 'number', 'select', 'toggle'],
      required: true,
    },
    unit: { type: String, default: '' },
    description: { type: String, default: '' },
    min: Number,
    max: Number,
    step: Number,
    options: {
      type: [ControlOptionSchema],
      default: [],
    },
  },
  { _id: false }
);

const FormulaSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    expression: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const ChartSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    xKey: { type: String, required: true, trim: true },
    yKey: { type: String, required: true, trim: true },
    xLabel: { type: String, required: true, trim: true },
    yLabel: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const TutorialChapterSchema = new Schema(
  {
    chapterNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    keyPoints: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const ValidationRuleSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    implemented: { type: Boolean, default: false },
  },
  { _id: false }
);

const ConceptDefinitionSchema = new Schema<IConceptDefinition>(
  {
    conceptId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['physics', 'chemistry', 'math'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    theory: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    duration: {
      type: Number,
      default: 30,
    },
    objectives: {
      type: [String],
      default: [],
    },
    controls: {
      type: [ControlSchema],
      default: [],
    },
    formulas: {
      type: [FormulaSchema],
      default: [],
    },
    charts: {
      type: [ChartSchema],
      default: [],
    },
    tutorialChapters: {
      type: [TutorialChapterSchema],
      default: [],
    },
    validationRules: {
      type: [ValidationRuleSchema],
      default: [],
    },
    defaultState: {
      type: Schema.Types.Mixed,
      default: {},
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
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ConceptDefinitionSchema.index({ createdBy: 1, category: 1 });

const ConceptDefinition: Model<IConceptDefinition> =
  mongoose.models.ConceptDefinition ||
  mongoose.model<IConceptDefinition>('ConceptDefinition', ConceptDefinitionSchema);

export default ConceptDefinition;
