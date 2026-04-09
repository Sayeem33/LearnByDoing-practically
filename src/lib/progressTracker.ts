import dbConnect from '@/lib/dbConnect';
import UserProgress, {
  IAchievement,
  ICompletedStep,
  ILabProgress,
  IProgressStats,
  ITutorialProgress,
  IUserProgress,
} from '@/models/UserProgress';

type ProgressCategory = 'physics' | 'chemistry' | 'technology' | 'math';
type StepKind = 'tutorial' | 'lab' | 'achievement' | 'system';
type LabStatus = 'draft' | 'completed' | 'submitted';

interface StepInput {
  stepId: string;
  title: string;
  kind: StepKind;
  itemId?: string;
  itemType?: string;
  category?: ProgressCategory;
}

interface TutorialProgressInput {
  tutorialId: string;
  experimentName: string;
  category: ProgressCategory;
  totalChapters: number;
  chapterNumber?: number;
  completed?: boolean;
}

interface LabProgressInput {
  experimentType: string;
  experimentName: string;
  category: ProgressCategory;
  savedExperimentId?: string;
  event?: 'opened' | 'saved' | 'report_saved' | 'completed' | 'submitted';
  status?: LabStatus;
  reportSaved?: boolean;
}

interface AchievementDefinition {
  achievementId: string;
  title: string;
  description: string;
  kind: IAchievement['kind'];
  icon?: string;
}

const DEFAULT_STATS: IProgressStats = {
  completedStepsCount: 0,
  achievementsCount: 0,
  completedTutorialsCount: 0,
  tutorialsInProgressCount: 0,
  completedLabsCount: 0,
  submittedLabsCount: 0,
  tutorialCompletionRate: 0,
  labCompletionRate: 0,
};

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function calculateStats(progress: IUserProgress): IProgressStats {
  const tutorials = progress.tutorialProgress || [];
  const labs = progress.labProgress || [];

  const completedTutorials = tutorials.filter((entry) => Boolean(entry.completedAt));
  const tutorialsInProgress = tutorials.filter(
    (entry) => !entry.completedAt && entry.completedChapters.length > 0
  );
  const completedLabs = labs.filter(
    (entry) => entry.status === 'completed' || entry.status === 'submitted'
  );
  const submittedLabs = labs.filter((entry) => entry.status === 'submitted');

  const tutorialCompletionRate =
    tutorials.length > 0
      ? round(
          tutorials.reduce((total, entry) => total + entry.completionPercent, 0) / tutorials.length
        )
      : 0;
  const labCompletionRate =
    labs.length > 0
      ? round(labs.reduce((total, entry) => total + entry.completionPercent, 0) / labs.length)
      : 0;

  return {
    completedStepsCount: progress.completedSteps.length,
    achievementsCount: progress.achievements.length,
    completedTutorialsCount: completedTutorials.length,
    tutorialsInProgressCount: tutorialsInProgress.length,
    completedLabsCount: completedLabs.length,
    submittedLabsCount: submittedLabs.length,
    tutorialCompletionRate,
    labCompletionRate,
  };
}

function ensureAchievement(progress: IUserProgress, definition: AchievementDefinition) {
  const exists = progress.achievements.some(
    (achievement) => achievement.achievementId === definition.achievementId
  );

  if (exists) return;

  progress.achievements.push({
    ...definition,
    earnedAt: new Date(),
  } as IAchievement);
}

function syncAchievements(progress: IUserProgress) {
  const stats = calculateStats(progress);
  const categories = new Set<ProgressCategory>();

  progress.tutorialProgress.forEach((entry) => {
    if (entry.completedChapters.length > 0) categories.add(entry.category);
  });

  progress.labProgress.forEach((entry) => {
    if (entry.savesCount > 0 || entry.status !== 'draft') categories.add(entry.category);
  });

  if (stats.completedStepsCount >= 1) {
    ensureAchievement(progress, {
      achievementId: 'first_step',
      title: 'First Step',
      description: 'Completed your first tracked learning step in SimuLab.',
      kind: 'progress',
      icon: 'Sparkles',
    });
  }

  if (stats.completedTutorialsCount >= 1) {
    ensureAchievement(progress, {
      achievementId: 'curious_reader',
      title: 'Curious Reader',
      description: 'Finished your first full tutorial.',
      kind: 'tutorial',
      icon: 'BookOpen',
    });
  }

  if (progress.labProgress.length >= 1) {
    ensureAchievement(progress, {
      achievementId: 'lab_starter',
      title: 'Lab Starter',
      description: 'Started your first virtual lab session.',
      kind: 'lab',
      icon: 'FlaskConical',
    });
  }

  if (stats.completedLabsCount >= 1) {
    ensureAchievement(progress, {
      achievementId: 'science_finisher',
      title: 'Science Finisher',
      description: 'Completed your first lab workflow.',
      kind: 'lab',
      icon: 'CheckCircle2',
    });
  }

  if (stats.submittedLabsCount >= 1) {
    ensureAchievement(progress, {
      achievementId: 'report_submitter',
      title: 'Report Submitter',
      description: 'Submitted a lab with a saved report.',
      kind: 'lab',
      icon: 'FileText',
    });
  }

  if (stats.completedStepsCount >= 5) {
    ensureAchievement(progress, {
      achievementId: 'momentum_builder',
      title: 'Momentum Builder',
      description: 'Completed five tracked steps across tutorials and labs.',
      kind: 'progress',
      icon: 'TrendingUp',
    });
  }

  if (categories.size >= 2) {
    ensureAchievement(progress, {
      achievementId: 'cross_discipline_explorer',
      title: 'Cross-Discipline Explorer',
      description: 'Made progress across more than one subject area.',
      kind: 'progress',
      icon: 'Award',
    });
  }

  progress.stats = calculateStats(progress);
}

async function ensureProgressDocument(userId: string) {
  await dbConnect();

  let progress = await UserProgress.findOne({ userId });

  if (!progress) {
    progress = new UserProgress({
      userId,
      completedSteps: [],
      achievements: [],
      tutorialProgress: [],
      labProgress: [],
      stats: DEFAULT_STATS,
    });
  }

  if (!progress.stats) {
    progress.stats = { ...DEFAULT_STATS };
  }

  return progress;
}

function addCompletedStep(progress: IUserProgress, input: StepInput) {
  const exists = progress.completedSteps.some((step) => step.stepId === input.stepId);

  if (exists) return;

  progress.completedSteps.push({
    ...input,
    completedAt: new Date(),
  } as ICompletedStep);
}

function getLabCompletionPercent(status: LabStatus, reportSaved: boolean, savesCount: number) {
  let base = 15;

  if (savesCount > 0) base = Math.max(base, 45);
  if (reportSaved) base = Math.max(base, 70);
  if (status === 'completed') base = Math.max(base, 85);
  if (status === 'submitted') base = 100;

  return base;
}

export async function getProgress(userId: string) {
  const progress = await ensureProgressDocument(userId);
  syncAchievements(progress);
  await progress.save();
  return progress;
}

export async function markStepCompleted(userId: string, experimentType: string, step: string) {
  const progress = await ensureProgressDocument(userId);

  addCompletedStep(progress, {
    stepId: `lab:${experimentType}:${step}`,
    title: step,
    kind: 'lab',
    itemId: experimentType,
    itemType: 'experiment',
  });

  syncAchievements(progress);
  await progress.save();
  return progress;
}

export async function awardAchievement(
  userId: string,
  achievementId: string,
  options?: Partial<Omit<AchievementDefinition, 'achievementId'>>
) {
  const progress = await ensureProgressDocument(userId);

  ensureAchievement(progress, {
    achievementId,
    title: options?.title || achievementId,
    description: options?.description || 'Achievement earned in SimuLab.',
    kind: options?.kind || 'progress',
    icon: options?.icon,
  });

  syncAchievements(progress);
  await progress.save();
  return progress;
}

export async function trackTutorialProgress(userId: string, input: TutorialProgressInput) {
  const progress = await ensureProgressDocument(userId);
  const now = new Date();
  const tutorialId = input.tutorialId;
  const chapterNumber =
    typeof input.chapterNumber === 'number' && input.chapterNumber > 0 ? input.chapterNumber : 1;

  let entry = progress.tutorialProgress.find((item) => item.tutorialId === tutorialId);

  if (!entry) {
    entry = {
      tutorialId,
      experimentName: input.experimentName,
      category: input.category,
      totalChapters: input.totalChapters,
      completedChapters: [],
      lastChapter: chapterNumber,
      completionPercent: 0,
      startedAt: now,
      lastViewedAt: now,
      completedAt: null,
    } as ITutorialProgress;

    progress.tutorialProgress.push(entry);
    addCompletedStep(progress, {
      stepId: `tutorial:${tutorialId}:opened`,
      title: `Opened ${input.experimentName} tutorial`,
      kind: 'tutorial',
      itemId: tutorialId,
      itemType: 'tutorial',
      category: input.category,
    });
  }

  entry.experimentName = input.experimentName;
  entry.category = input.category;
  entry.totalChapters = Math.max(input.totalChapters, 1);
  entry.lastChapter = chapterNumber;
  entry.lastViewedAt = now;

  if (!entry.completedChapters.includes(chapterNumber)) {
    entry.completedChapters.push(chapterNumber);
    entry.completedChapters.sort((a, b) => a - b);
    addCompletedStep(progress, {
      stepId: `tutorial:${tutorialId}:chapter:${chapterNumber}`,
      title: `Viewed chapter ${chapterNumber} in ${input.experimentName}`,
      kind: 'tutorial',
      itemId: tutorialId,
      itemType: 'tutorial',
      category: input.category,
    });
  }

  const completed =
    input.completed || entry.completedChapters.length >= Math.max(entry.totalChapters, 1);

  entry.completionPercent = round(
    (entry.completedChapters.length / Math.max(entry.totalChapters, 1)) * 100
  );

  if (completed && !entry.completedAt) {
    entry.completedAt = now;
    entry.completionPercent = 100;
    addCompletedStep(progress, {
      stepId: `tutorial:${tutorialId}:completed`,
      title: `Completed ${input.experimentName} tutorial`,
      kind: 'tutorial',
      itemId: tutorialId,
      itemType: 'tutorial',
      category: input.category,
    });
  }

  syncAchievements(progress);
  await progress.save();
  return progress;
}

export async function trackLabProgress(userId: string, input: LabProgressInput) {
  const progress = await ensureProgressDocument(userId);
  const now = new Date();
  const status = input.status || 'draft';
  const event = input.event || 'opened';

  let entry = progress.labProgress.find((item) =>
    input.savedExperimentId
      ? item.savedExperimentId === input.savedExperimentId
      : item.experimentType === input.experimentType
  );

  if (!entry) {
    entry = {
      experimentType: input.experimentType,
      experimentName: input.experimentName,
      category: input.category,
      savedExperimentId: input.savedExperimentId,
      status,
      reportSaved: Boolean(input.reportSaved),
      savesCount: 0,
      completionPercent: 0,
      startedAt: now,
      lastWorkedAt: now,
      completedAt: null,
      submittedAt: null,
    } as ILabProgress;

    progress.labProgress.push(entry);
    addCompletedStep(progress, {
      stepId: `lab:${input.savedExperimentId || input.experimentType}:started`,
      title: `Started ${input.experimentName} lab`,
      kind: 'lab',
      itemId: input.savedExperimentId || input.experimentType,
      itemType: 'lab',
      category: input.category,
    });
  }

  entry.experimentName = input.experimentName;
  entry.category = input.category;
  entry.lastWorkedAt = now;
  entry.status = status;
  entry.savedExperimentId = input.savedExperimentId || entry.savedExperimentId;
  entry.reportSaved = entry.reportSaved || Boolean(input.reportSaved);
  if (event === 'saved' || event === 'report_saved') {
    entry.savesCount += 1;
  }

  if ((event === 'completed' || status === 'completed') && !entry.completedAt) {
    entry.completedAt = now;
    addCompletedStep(progress, {
      stepId: `lab:${entry.savedExperimentId || input.experimentType}:completed`,
      title: `Completed ${input.experimentName} lab`,
      kind: 'lab',
      itemId: entry.savedExperimentId || input.experimentType,
      itemType: 'lab',
      category: input.category,
    });
  }

  if ((event === 'submitted' || status === 'submitted') && !entry.submittedAt) {
    entry.submittedAt = now;
    entry.completedAt = entry.completedAt || now;
    addCompletedStep(progress, {
      stepId: `lab:${entry.savedExperimentId || input.experimentType}:submitted`,
      title: `Submitted ${input.experimentName} lab`,
      kind: 'lab',
      itemId: entry.savedExperimentId || input.experimentType,
      itemType: 'lab',
      category: input.category,
    });
  }

  if (event === 'report_saved' || Boolean(input.reportSaved)) {
    addCompletedStep(progress, {
      stepId: `lab:${entry.savedExperimentId || input.experimentType}:report`,
      title: `Saved a report for ${input.experimentName}`,
      kind: 'lab',
      itemId: entry.savedExperimentId || input.experimentType,
      itemType: 'lab',
      category: input.category,
    });
  } else if (event === 'saved') {
    addCompletedStep(progress, {
      stepId: `lab:${entry.savedExperimentId || input.experimentType}:saved`,
      title: `Saved progress for ${input.experimentName}`,
      kind: 'lab',
      itemId: entry.savedExperimentId || input.experimentType,
      itemType: 'lab',
      category: input.category,
    });
  }

  entry.completionPercent = getLabCompletionPercent(status, entry.reportSaved, entry.savesCount);

  syncAchievements(progress);
  await progress.save();
  return progress;
}
