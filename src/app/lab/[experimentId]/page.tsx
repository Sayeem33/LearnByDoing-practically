'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Slider from '@/components/ui/Slider';
import Toolbar from '@/components/workbench/Toolbar';
import PhysicsLayer from '@/components/workbench/PhysicsLayer';
import AcidBaseWorkbench from '@/components/workbench/AcidBaseWorkbench';
import FreeFallWorkbench from '@/components/workbench/FreeFallWorkbench';
import TitrationWorkbench from '@/components/workbench/TitrationWorkbench';
import CollisionWorkbench from '@/components/workbench/CollisionWorkbench';
import PendulumWorkbench from '@/components/workbench/PendulumWorkbench';
import ProjectileWorkbench from '@/components/workbench/ProjectileWorkbench';
import ElectrolysisWorkbench from '@/components/workbench/ElectrolysisWorkbench';
import FlameTestWorkbench from '@/components/workbench/FlameTestWorkbench';
import CrystallizationWorkbench from '@/components/workbench/CrystallizationWorkbench';
import DisplacementWorkbench from '@/components/workbench/DisplacementWorkbench';
import LiveChart from '@/components/analysis/LiveChart';
import DataLogger from '@/components/analysis/DataLogger';
import EvidencePanel from '@/components/analysis/EvidencePanel';
import LabReportPanel from '@/components/analysis/LabReportPanel';
import ValidationDashboard from '@/components/analysis/ValidationDashboard';
import ExportBtn from '@/components/analysis/ExportBtn';
import { useSimulation } from '@/hooks/useSimulation';
import { useDataStream } from '@/hooks/useDataStream';
import {
  Play,
  Pause,
  RotateCcw,
  Save,
  CheckCircle2,
  Send,
  ArrowLeft,
  BookOpen,
  Info,
} from 'lucide-react';
import { EXPERIMENT_TEMPLATES, PHYSICS, CANVAS } from '@/lib/constants';
import { buildEvidenceSummary } from '@/lib/evidence';
import { generateReport } from '@/lib/reportGenerator';
import { getValidationSummary, SUPPORTED_VALIDATION_EXPERIMENTS } from '@/lib/validation';

interface LabWorkspaceProps {
  params: { experimentId: string };
}

type ExperimentStatus = 'draft' | 'completed' | 'submitted';
type ReviewState = {
  status: 'not_reviewed' | 'pending_review' | 'approved' | 'changes_requested';
  feedback?: string;
  reviewedBy?: string;
  reviewerRole?: string;
  reviewedAt?: string | null;
};

export default function LabWorkspace({ params }: LabWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { experimentId } = params;
  const savedExperimentParam = searchParams.get('saved');

  // Get experiment template - use query param 'type' if experimentId is 'new'
  const experimentType = experimentId === 'new' 
    ? (searchParams.get('type') || 'freefall') 
    : experimentId;
  const template = EXPERIMENT_TEMPLATES[experimentType as keyof typeof EXPERIMENT_TEMPLATES];

  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [objects, setObjects] = useState<any[]>([]);
  const [height, setHeight] = useState<number>(100); // For free fall experiments
  const [savedExperimentId, setSavedExperimentId] = useState<string | null>(savedExperimentParam);
  const [experimentStatus, setExperimentStatus] = useState<ExperimentStatus>('draft');
  const [isPersisting, setIsPersisting] = useState(false);
  const [labReport, setLabReport] = useState('');
  const [savedLabReport, setSavedLabReport] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [workbenchSnapshot, setWorkbenchSnapshot] = useState<any | null>(null);
  const [isLoadingSavedExperiment, setIsLoadingSavedExperiment] = useState(Boolean(savedExperimentParam));
  const [reviewState, setReviewState] = useState<ReviewState>({
    status: 'not_reviewed',
    feedback: '',
    reviewedBy: '',
    reviewerRole: '',
    reviewedAt: null,
  });

  // Physics simulation
  const {
    physicsEngine,
    chemistryEngine,
    simulationLoop,
    state: simState,
    start,
    stop,
    reset,
    addDataPoint,
  } = useSimulation((template?.category || 'physics') as 'physics' | 'chemistry');

  // Data collection
  const { dataPoints, setDataPoints, capture, startCapture, stopCapture, clearData, exportCSV } =
    useDataStream({
      maxPoints: 1000,
      captureInterval: 50,
    });

  const dedicatedWorkbenchExperiments = new Set([
    'acidbase',
    'titration',
    'collision',
    'pendulum',
    'projectilemotion',
    'electrolysis',
    'flametest',
    'crystallization',
    'displacement',
  ]);

  const activeDataPoints = Array.isArray(workbenchSnapshot?.dataPoints)
    ? workbenchSnapshot.dataPoints
    : dataPoints;
  const isReportDirty = labReport !== savedLabReport;
  const currentAnalysisSnapshot = workbenchSnapshot
    ? { ...workbenchSnapshot, dataPoints: activeDataPoints }
    : {
        objects,
        height,
        dataPoints: activeDataPoints,
      };
  const shouldShowValidationPanel = SUPPORTED_VALIDATION_EXPERIMENTS.has(experimentType);
  const validationSummary = getValidationSummary(
    experimentType,
    currentAnalysisSnapshot,
    activeDataPoints
  );
  const evidenceSummary = buildEvidenceSummary({
    title: template?.name || experimentType,
    experimentType,
    category: template?.category,
    experimentStatus,
    results: activeDataPoints,
    snapshot: {
      ...currentAnalysisSnapshot,
      validation: validationSummary,
    },
    validation: validationSummary,
    labReport,
    savedExperimentId,
    review: reviewState,
  });

  const createPhysicsObjects = (sourceObjects: any[]) => {
    if (!physicsEngine) return [];

    const created: any[] = [];

    sourceObjects.forEach((obj: any) => {
      let id: string | null = null;
      const rawMeta = obj.metadata?.metadata || obj.meta || obj.metadata || obj;
      const x = obj.position?.x ?? obj.x ?? 100;
      const y = obj.position?.y ?? obj.y ?? 100;

      switch (obj.type) {
        case 'ball':
          id = physicsEngine.createBall(x, y, obj.radius || rawMeta.radius || 20, rawMeta);
          break;
        case 'box':
          id = physicsEngine.createBox(
            x,
            y,
            obj.width || rawMeta.width || 60,
            obj.height || rawMeta.height || 60,
            rawMeta
          );
          break;
        case 'ramp':
          id = physicsEngine.createRamp(
            x,
            y,
            obj.width || rawMeta.width || 200,
            obj.angle || 30,
            rawMeta
          );
          break;
        case 'pendulum':
          id = physicsEngine.createPendulum(x, y, obj.length || rawMeta.length || 150, rawMeta);
          break;
        case 'cannon': {
          const meta = {
            ...rawMeta,
            autoLaunch: rawMeta.autoLaunch === false ? false : obj.autoLaunch === false ? false : true,
          };
          id = physicsEngine.createBall(
            x || 50,
            y || 400,
            obj.radius || rawMeta.radius || 8,
            { isSensor: true, render: { fillStyle: '#222' }, metadata: meta }
          );
          break;
        }
        default:
          break;
      }

      if (id && obj.velocity) {
        physicsEngine.setVelocity(id, obj.velocity);
      }

      if (id) {
        created.push({
          ...obj,
          id,
          x,
          y,
          meta: rawMeta,
        });
      }
    });

    return created;
  };

  useEffect(() => {
    setSavedExperimentId(savedExperimentParam);
  }, [savedExperimentParam]);

  useEffect(() => {
    const fetchSavedExperiment = async () => {
      if (!savedExperimentParam) {
        setExperimentStatus('draft');
        setWorkbenchSnapshot(null);
        setLabReport('');
        setSavedLabReport('');
        setReviewState({
          status: 'not_reviewed',
          feedback: '',
          reviewedBy: '',
          reviewerRole: '',
          reviewedAt: null,
        });
        setIsLoadingSavedExperiment(false);
        return;
      }

      setIsLoadingSavedExperiment(true);

      try {
        const response = await fetch(`/api/experiments/${savedExperimentParam}`);
        if (!response.ok) {
          setWorkbenchSnapshot(null);
          return;
        }

        const result = await response.json();
        if (result.success && result.data?.status) {
          const savedState = result.data.state || null;
          setSavedExperimentId(result.data._id);
          setExperimentStatus(result.data.status);
          setWorkbenchSnapshot(savedState);
          setLabReport(result.data.labReport || '');
          setSavedLabReport(result.data.labReport || '');
          setReviewState(
            result.data.review || {
              status: 'not_reviewed',
              feedback: '',
              reviewedBy: '',
              reviewerRole: '',
              reviewedAt: null,
            }
          );

          if (typeof savedState?.height === 'number') {
            setHeight(savedState.height);
          }

          if (Array.isArray(savedState?.dataPoints)) {
            setDataPoints(savedState.dataPoints);
          }
        }
      } catch (error) {
        console.error('Failed to fetch saved experiment:', error);
      } finally {
        setIsLoadingSavedExperiment(false);
      }
    };

    fetchSavedExperiment();
  }, [savedExperimentParam, setDataPoints]);

  // Apply template initial setup when physics engine becomes available
  useEffect(() => {
    if (!physicsEngine || !template?.initialSetup || dedicatedWorkbenchExperiments.has(experimentType)) {
      return;
    }

    const restoredObjects = Array.isArray(workbenchSnapshot?.objects)
      ? workbenchSnapshot.objects
      : null;
    const setupObjects =
      restoredObjects ||
      ('objects' in template.initialSetup && Array.isArray((template.initialSetup as any).objects)
        ? ((template.initialSetup as any).objects as any[])
        : []);

    if (setupObjects.length === 0) return;

    physicsEngine.reset();
    const created = createPhysicsObjects(setupObjects);
    setObjects(created);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [physicsEngine, template?.initialSetup, workbenchSnapshot?.objects, experimentType]);

  // Auto-launch projectile from cannon when simulation starts
  useEffect(() => {
    if (!simState.isRunning || !physicsEngine) return;
    if (experimentType !== 'projectilemotion') return;

    // find cannon object (not yet launched)
    const cannonObj = objects.find((o) => o.type === 'cannon' && !o.launched);
    if (!cannonObj) return;

    const meta = cannonObj.meta || {};
    // respect template's autoLaunch flag (default true)
    if (meta.autoLaunch === false) return;

    const angle = meta.angle || 45;
    const speed = meta.velocity || 20;

    // use ProjectileEngine semantics (m/s -> px/s conversion handled by engine.launch)
    // spawn and launch projectile
    // create projectile and set velocity using utility on physicsEngine
    const rad = (angle * Math.PI) / 180;
    // Convert speed to px/s using PHYSICS.SCALE in engine.launch; here we mimic that logic
    const { PHYSICS } = require('@/lib/constants');
    const speedPx = speed * PHYSICS.SCALE;
    const vx = speedPx * Math.cos(rad);
    const vy = -speedPx * Math.sin(rad);

    const projId = physicsEngine.createBall(cannonObj.x || 50, cannonObj.y || 400, meta.radius || 8, { color: '#ef4444' });
    physicsEngine.setVelocity(projId, { x: vx, y: vy });

    // mark cannon as launched to prevent repeated launches
    setObjects((prev) => prev.map((o) => (o.id === cannonObj.id ? { ...o, launched: true } : o)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simState.isRunning, physicsEngine]);

  const chartRef = useRef<HTMLDivElement>(null);

  // Handle start/stop
  const handleStart = () => {
    // For free fall experiments, reposition ball to correct height before starting
    if (experimentType === 'freefall' && physicsEngine && objects.length > 0) {
      const ballObj = objects.find(o => o.type === 'ball');
      if (ballObj && ballObj.id) {
        try {
          // Remove old ball and create new one at correct height
          physicsEngine.removeObject(ballObj.id);
          const newId = physicsEngine.createBall(
            CANVAS.WIDTH / 2, // centered horizontally
            height, // user-selected height
            20, // radius
            { color: '#ef4444' }
          );
          // Update objects state with new ID
          setObjects(prev => prev.map(o => o.type === 'ball' ? { ...o, id: newId } : o));
        } catch (e) {
          console.error('Failed to reposition ball:', e);
        }
      }
    }
    start();
    startCapture();
  };

  const handleStop = () => {
    stop();
    stopCapture();
  };

  const handleReset = () => {
    reset();
    clearData();
    setObjects([]);
  };

  // Handle canvas click to add objects
  const handleCanvasClick = (x: number, y: number) => {
    if (!selectedTool || !physicsEngine) return;

    let objectId: string | null = null;

    switch (selectedTool.type) {
      case 'ball':
        objectId = physicsEngine.createBall(x, y, 20, { color: selectedTool.color });
        break;
      case 'box':
        objectId = physicsEngine.createBox(x, y, 60, 60, { color: selectedTool.color });
        break;
      case 'ramp':
        objectId = physicsEngine.createRamp(x, y, 200, 30, { color: selectedTool.color });
        break;
      case 'pendulum':
        objectId = physicsEngine.createPendulum(x, y, 150, { color: selectedTool.color });
        break;
    }

    if (objectId) {
      setObjects((prev) => [...prev, { id: objectId, type: selectedTool.type, x, y }]);
    }
  };

  // Data collection callback - improved version
  const handlePhysicsUpdate = (data: any) => {
    if (!simState.isRunning || !Array.isArray(data) || data.length === 0) return;
    
    // Use first body's data (usually the main object we're tracking)
    const obj = data[0];
    if (!obj) return;

    // Calculate proper values in SI units
    const timeSeconds = simState.time;
    const positionM = obj.position?.y ? (obj.position.y / PHYSICS.SCALE) : 0;
    const velocityMs = obj.velocity?.y ? (obj.velocity.y / PHYSICS.SCALE) : 0;
    const speedMs = obj.speed ? (obj.speed / PHYSICS.SCALE) : 0;

    capture({
      time: timeSeconds,
      position: positionM,
      velocity: velocityMs,
      speed: speedMs,
      x: obj.position?.x || 0,
      y: obj.position?.y || 0,
      vx: obj.velocity?.x || 0,
      vy: obj.velocity?.y || 0,
    });
  };

  const syncSavedExperimentUrl = (nextSavedId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('saved', nextSavedId);

    if (experimentId === 'new') {
      params.set('type', experimentType);
    }

    router.replace(`/lab/${experimentId}?${params.toString()}`);
  };

  const syncLabProgress = async ({
    event = 'opened',
    status = 'draft',
    reportSaved = false,
    savedExperimentRef,
  }: {
    event?: 'opened' | 'saved' | 'report_saved' | 'completed' | 'submitted';
    status?: ExperimentStatus;
    reportSaved?: boolean;
    savedExperimentRef?: string | null;
  }) => {
    if (!template) return;

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'lab_progress',
          experimentType,
          experimentName: template.name,
          category: template.category,
          savedExperimentId: savedExperimentRef || savedExperimentId || savedExperimentParam,
          event,
          status,
          reportSaved,
        }),
      });
    } catch (progressError) {
      console.error('Failed to sync lab progress:', progressError);
    }
  };

  useEffect(() => {
    if (!template || isLoadingSavedExperiment) return;

    syncLabProgress({
      event: 'opened',
      status: experimentStatus,
      reportSaved: Boolean(labReport.trim()),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, experimentType, isLoadingSavedExperiment]);

  const persistExperiment = async (nextStatus: ExperimentStatus = 'draft') => {
    if (!template) return { success: false };

    setIsPersisting(true);

    try {
      const livePhysicsObjects =
        !dedicatedWorkbenchExperiments.has(experimentType) && physicsEngine
          ? physicsEngine.getAllObjectsData().map((obj: any) => ({
              type: obj.type,
              x: obj.position?.x,
              y: obj.position?.y,
              velocity: obj.velocity,
              angle: obj.angle,
              speed: obj.speed,
              metadata: obj.metadata,
            }))
          : objects;

      const nextState = {
        ...currentAnalysisSnapshot,
        objects: currentAnalysisSnapshot.objects ?? livePhysicsObjects,
        dataPoints: activeDataPoints,
        height: currentAnalysisSnapshot.height ?? height,
        validation: validationSummary,
        savedAt: new Date().toISOString(),
      };

      const payload = {
        title: `${template.name} - ${new Date().toLocaleDateString()}`,
        description: template.description,
        category: template.category,
        experimentType,
        status: nextStatus,
        state: nextState,
        labReport: labReport.trim(),
      };

      const isUpdating = Boolean(savedExperimentId);
      const response = await fetch(
        isUpdating ? `/api/experiments/${savedExperimentId}` : '/api/experiments',
        {
          method: isUpdating ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401) {
        alert('Please log in to manage experiments.');
        router.push('/login');
        return { success: false };
      }

      const result = await response.json();
      if (!response.ok || !result.success) {
        alert(result.error || 'Failed to save experiment');
        return { success: false };
      }

      const persistedId = result.data?._id;
      if (persistedId) {
        setSavedExperimentId(persistedId);
        syncSavedExperimentUrl(persistedId);
      }

      setExperimentStatus(result.data?.status || nextStatus);
      setSavedLabReport(result.data?.labReport || labReport.trim());
      if (result.data?.review) {
        setReviewState(result.data.review);
      }
      await syncLabProgress({
        event:
          (result.data?.status || nextStatus) === 'submitted'
            ? 'submitted'
            : (result.data?.status || nextStatus) === 'completed'
              ? 'completed'
              : labReport.trim()
                ? 'report_saved'
                : 'saved',
        status: result.data?.status || nextStatus,
        reportSaved: Boolean((result.data?.labReport || labReport.trim()).trim()),
        savedExperimentRef: persistedId || savedExperimentId,
      });
      return {
        success: true,
        persistedId,
        status: result.data?.status || nextStatus,
      };
    } catch (error) {
      console.error('Failed to persist experiment:', error);
      alert('Failed to save experiment');
      return { success: false };
    } finally {
      setIsPersisting(false);
    }
  };

  const handleSave = async () => {
    const result = await persistExperiment('draft');
    if (result.success) {
      alert(savedExperimentId ? 'Experiment updated successfully!' : 'Experiment saved successfully!');
    }
  };

  const handleStatusChange = async (nextStatus: ExperimentStatus) => {
    if (nextStatus === 'submitted' && !labReport.trim()) {
      alert('Generate and review your lab report before submitting this experiment.');
      return;
    }

    const result = await persistExperiment(nextStatus);
    if (result.success) {
      alert(`Experiment ${nextStatus} successfully!`);
    }
  };

  const handleGenerateReport = () => {
    if (!template) return;

    setIsGeneratingReport(true);

    try {
      const report = generateReport({
        title: savedExperimentId ? `${template.name} Lab Session` : template.name,
        description: template.description,
        experimentType,
        category: template.category,
        status: experimentStatus,
        theory: template.theory,
        objectives: template.objectives,
        results: activeDataPoints,
        snapshot: {
          ...currentAnalysisSnapshot,
          validation: validationSummary,
        },
        generatedAt: new Date().toISOString(),
      });

      setLabReport(report);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveReport = async () => {
    const trimmedReport = labReport.trim();
    if (!trimmedReport) {
      alert('Generate or write a report before saving.');
      return;
    }

    setIsSavingReport(true);

    try {
      const result = await persistExperiment('draft');
      if (result.success) {
        setSavedLabReport(trimmedReport);
        alert('Lab report saved successfully.');
      }
    } finally {
      setIsSavingReport(false);
    }
  };

  const handleDownloadReport = () => {
    if (!labReport.trim()) {
      alert('There is no report to download yet.');
      return;
    }

    const blob = new Blob([labReport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${experimentType}_lab_report_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderReportPanel = () => (
    <LabReportPanel
      report={labReport}
      onChange={setLabReport}
      onGenerate={handleGenerateReport}
      onSave={handleSaveReport}
      onDownload={handleDownloadReport}
      isGenerating={isGeneratingReport}
      isSaving={isSavingReport}
      hasSavedExperiment={Boolean(savedExperimentId)}
      isDirty={isReportDirty}
      experimentStatus={experimentStatus}
    />
  );

  const renderAnalysisPanels = () => (
    <div className="space-y-6">
      {shouldShowValidationPanel ? (
        <ValidationDashboard summary={validationSummary} />
      ) : null}
      <EvidencePanel summary={evidenceSummary} />
      {reviewState.status !== 'not_reviewed' || reviewState.feedback?.trim() ? (
        <Card className="border border-slate-200 bg-gradient-to-br from-white to-amber-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Instructor Review</h3>
              <p className="mt-1 text-sm text-gray-600">
                Feedback and review status synced from the instructor queue.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                reviewState.status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : reviewState.status === 'changes_requested'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
              }`}
            >
              {reviewState.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-gray-700 whitespace-pre-wrap">
            {reviewState.feedback?.trim() || 'No instructor feedback has been added yet.'}
          </div>

          {reviewState.reviewedAt ? (
            <p className="mt-3 text-xs text-gray-500">
              Reviewed by {reviewState.reviewedBy || 'reviewer'} on{' '}
              {new Date(reviewState.reviewedAt).toLocaleString()}.
            </p>
          ) : null}
        </Card>
      ) : null}
      {renderReportPanel()}
    </div>
  );

  const renderLifecycleActions = () => (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSave}
        leftIcon={<Save size={18} />}
        disabled={isPersisting}
      >
        {savedExperimentId ? 'Update Draft' : 'Save Draft'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStatusChange('completed')}
        leftIcon={<CheckCircle2 size={18} />}
        disabled={isPersisting || experimentStatus === 'completed' || experimentStatus === 'submitted'}
      >
        Mark Completed
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => handleStatusChange('submitted')}
        leftIcon={<Send size={18} />}
        disabled={isPersisting || experimentStatus === 'submitted' || !labReport.trim()}
      >
        Submit
      </Button>
    </>
  );

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Experiment not found
          </h1>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (savedExperimentParam && isLoadingSavedExperiment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Restoring saved experiment</h2>
          <p className="text-sm text-gray-600">
            Reloading your previous lab state and recorded data.
          </p>
        </Card>
      </div>
    );
  }

  // For chemistry experiments, render dedicated workbench
  if (template.category === 'chemistry') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                leftIcon={<ArrowLeft size={18} />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {renderLifecycleActions()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(!showTutorial)}
                leftIcon={<BookOpen size={18} />}
              >
                {showTutorial ? 'Hide' : 'Show'} Tutorial
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {/* Tutorial Panel for Chemistry */}
          {showTutorial && (
            <Card variant="glass" className="mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Theory & Objectives
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">{template.theory}</p>
                  <div className="text-sm">
                    <strong className="text-gray-900">Learning Objectives:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      {template.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Render appropriate workbench based on experiment type */}
          {experimentType === 'acidbase' && (
            <>
              <AcidBaseWorkbench
                key={savedExperimentId || 'acidbase-new'}
                initialSnapshot={workbenchSnapshot}
                onSnapshotChange={setWorkbenchSnapshot}
              />
              <div className="mt-6">{renderAnalysisPanels()}</div>
            </>
          )}
          {experimentType === 'titration' && (
            <>
              <TitrationWorkbench
                key={savedExperimentId || 'titration-new'}
                initialSnapshot={workbenchSnapshot}
                onSnapshotChange={setWorkbenchSnapshot}
              />
              <div className="mt-6">{renderAnalysisPanels()}</div>
            </>
          )}
          {experimentType === 'electrolysis' && (
            <>
              <ElectrolysisWorkbench
                key={savedExperimentId || 'electrolysis-new'}
                initialSnapshot={workbenchSnapshot}
                onSnapshotChange={setWorkbenchSnapshot}
              />
              <div className="mt-6">{renderAnalysisPanels()}</div>
            </>
          )}
          {experimentType === 'flametest' && (
            <>
              <FlameTestWorkbench
                key={savedExperimentId || 'flametest-new'}
                initialSnapshot={workbenchSnapshot}
                onSnapshotChange={setWorkbenchSnapshot}
              />
              <div className="mt-6">{renderAnalysisPanels()}</div>
            </>
          )}
          {experimentType === 'crystallization' && (
            <>
              <CrystallizationWorkbench
                key={savedExperimentId || 'crystallization-new'}
                initialSnapshot={workbenchSnapshot}
                onSnapshotChange={setWorkbenchSnapshot}
              />
              <div className="mt-6">{renderAnalysisPanels()}</div>
            </>
          )}
          {experimentType === 'displacement' && (
            <>
              <DisplacementWorkbench
                key={savedExperimentId || 'displacement-new'}
                initialSnapshot={workbenchSnapshot}
                onSnapshotChange={setWorkbenchSnapshot}
              />
              <div className="mt-6">{renderAnalysisPanels()}</div>
            </>
          )}
        </div>
      </div>
    );
  }

  // For collision experiment, render dedicated workbench
  if (experimentType === 'collision') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                leftIcon={<ArrowLeft size={18} />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {renderLifecycleActions()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(!showTutorial)}
                leftIcon={<BookOpen size={18} />}
              >
                {showTutorial ? 'Hide' : 'Show'} Tutorial
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {/* Tutorial Panel for Collision */}
          {showTutorial && (
            <Card variant="glass" className="mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Theory & Objectives
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">{template.theory}</p>
                  <div className="text-sm">
                    <strong className="text-gray-900">Learning Objectives:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      {template.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Collision Workbench */}
          <CollisionWorkbench
            key={savedExperimentId || 'collision-new'}
            initialSnapshot={workbenchSnapshot}
            onSnapshotChange={setWorkbenchSnapshot}
          />
          <div className="mt-6">{renderAnalysisPanels()}</div>
        </div>
      </div>
    );
  }

  // For pendulum experiment, render dedicated workbench
  if (experimentType === 'pendulum') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                leftIcon={<ArrowLeft size={18} />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {renderLifecycleActions()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(!showTutorial)}
                leftIcon={<BookOpen size={18} />}
              >
                {showTutorial ? 'Hide' : 'Show'} Tutorial
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {/* Tutorial Panel for Pendulum */}
          {showTutorial && (
            <Card variant="glass" className="mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Theory & Objectives
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">{template.theory}</p>
                  <div className="text-sm">
                    <strong className="text-gray-900">Learning Objectives:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      {template.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Pendulum Workbench */}
          <PendulumWorkbench
            key={savedExperimentId || 'pendulum-new'}
            initialSnapshot={workbenchSnapshot}
            onSnapshotChange={setWorkbenchSnapshot}
          />
          <div className="mt-6">{renderAnalysisPanels()}</div>
        </div>
      </div>
    );
  }

  // For projectile motion experiment, render dedicated workbench
  if (experimentType === 'projectilemotion') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                leftIcon={<ArrowLeft size={18} />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {renderLifecycleActions()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(!showTutorial)}
                leftIcon={<BookOpen size={18} />}
              >
                {showTutorial ? 'Hide' : 'Show'} Tutorial
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {/* Tutorial Panel for Projectile Motion */}
          {showTutorial && (
            <Card variant="glass" className="mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Theory & Objectives
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">{template.theory}</p>
                  <div className="text-sm">
                    <strong className="text-gray-900">Learning Objectives:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      {template.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Projectile Workbench */}
          <ProjectileWorkbench
            key={savedExperimentId || 'projectilemotion-new'}
            initialSnapshot={workbenchSnapshot}
            onSnapshotChange={setWorkbenchSnapshot}
          />
          <div className="mt-6">{renderAnalysisPanels()}</div>
        </div>
      </div>
    );
  }

  // For electrolysis experiment, render dedicated workbench
  if (experimentType === 'electrolysis') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                leftIcon={<ArrowLeft size={18} />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{template?.name || 'Electrolysis'}</h1>
                <p className="text-sm text-gray-600">{template?.description || 'Electrolysis of Water'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(!showTutorial)}
                leftIcon={<BookOpen size={18} />}
              >
                {showTutorial ? 'Hide' : 'Show'} Tutorial
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {showTutorial && template && (
            <Card variant="glass" className="mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Theory & Objectives</h3>
                  <p className="text-sm text-gray-700 mb-3">{template.theory}</p>
                  <div className="text-sm">
                    <strong className="text-gray-900">Learning Objectives:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      {template.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
          <ElectrolysisWorkbench />
          <div className="mt-6">{renderAnalysisPanels()}</div>
        </div>
      </div>
    );
  }

  // For flame test experiment, render dedicated workbench
  if (experimentType === 'flametest') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                leftIcon={<ArrowLeft size={18} />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{template?.name || 'Flame Test'}</h1>
                <p className="text-sm text-gray-600">{template?.description || 'Metal Ion Identification'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(!showTutorial)}
                leftIcon={<BookOpen size={18} />}
              >
                {showTutorial ? 'Hide' : 'Show'} Tutorial
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {showTutorial && template && (
            <Card variant="glass" className="mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Theory & Objectives</h3>
                  <p className="text-sm text-gray-700 mb-3">{template.theory}</p>
                  <div className="text-sm">
                    <strong className="text-gray-900">Learning Objectives:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      {template.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
          <FlameTestWorkbench />
          <div className="mt-6">{renderAnalysisPanels()}</div>
        </div>
      </div>
    );
  }

  // For crystallization experiment, render dedicated workbench
  if (experimentType === 'crystallization') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                leftIcon={<ArrowLeft size={18} />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{template?.name || 'Crystallization'}</h1>
                <p className="text-sm text-gray-600">{template?.description || 'Crystal Growth Experiment'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(!showTutorial)}
                leftIcon={<BookOpen size={18} />}
              >
                {showTutorial ? 'Hide' : 'Show'} Tutorial
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {showTutorial && template && (
            <Card variant="glass" className="mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Theory & Objectives</h3>
                  <p className="text-sm text-gray-700 mb-3">{template.theory}</p>
                  <div className="text-sm">
                    <strong className="text-gray-900">Learning Objectives:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      {template.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
          <CrystallizationWorkbench />
          <div className="mt-6">{renderAnalysisPanels()}</div>
        </div>
      </div>
    );
  }

  // For displacement experiment, render dedicated workbench
  if (experimentType === 'displacement') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                leftIcon={<ArrowLeft size={18} />}
              >
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{template?.name || 'Metal Displacement'}</h1>
                <p className="text-sm text-gray-600">{template?.description || 'Reactivity Series Demonstration'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(!showTutorial)}
                leftIcon={<BookOpen size={18} />}
              >
                {showTutorial ? 'Hide' : 'Show'} Tutorial
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {showTutorial && template && (
            <Card variant="glass" className="mb-6">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Theory & Objectives</h3>
                  <p className="text-sm text-gray-700 mb-3">{template.theory}</p>
                  <div className="text-sm">
                    <strong className="text-gray-900">Learning Objectives:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                      {template.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
          <DisplacementWorkbench />
          <div className="mt-6">{renderAnalysisPanels()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              leftIcon={<ArrowLeft size={18} />}
            >
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{template.name}</h1>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {renderLifecycleActions()}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTutorial(!showTutorial)}
              leftIcon={<BookOpen size={18} />}
            >
              {showTutorial ? 'Hide' : 'Show'} Tutorial
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Toolbar */}
          <div className="lg:col-span-2">
            <Toolbar
              category={template.category as any}
              onToolSelect={setSelectedTool}
              selectedTool={selectedTool}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-7">
            {/* Tutorial Panel */}
            {showTutorial && (
              <Card variant="glass" className="mb-6">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      Theory & Objectives
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">{template.theory}</p>
                    <div className="text-sm">
                      <strong className="text-gray-900">Learning Objectives:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                        {template.objectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Simulation Controls */}
            <Card className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!simState.isRunning ? (
                    <Button
                      variant="success"
                      onClick={handleStart}
                      leftIcon={<Play size={20} />}
                    >
                      Start Simulation
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      onClick={handleStop}
                      leftIcon={<Pause size={20} />}
                    >
                      Stop
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    leftIcon={<RotateCcw size={20} />}
                  >
                    Reset
                  </Button>
                </div>

                <div className="text-sm font-mono bg-gray-100 px-4 py-2 rounded-lg">
                  Time: {simState.time.toFixed(2)}s
                </div>
              </div>
            </Card>

            {/* Canvas - Physics Layer */}
            <Card className="mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">🎯 Simulation Canvas</h3>
              <div className="w-full bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden border-2 border-gray-300" style={{ minHeight: '500px' }}>
                <PhysicsLayer
                  engine={physicsEngine?.getEngine() || null}
                  isRunning={simState.isRunning}
                  onUpdate={handlePhysicsUpdate}
                  className="w-full h-full"
                />
              </div>
              {!simState.isRunning && dataPoints.length === 0 && (
                <p className="text-sm text-gray-600 mt-3 text-center">
                  👆 Click "Start Simulation" to begin. Then drag the ball if you want!
                </p>
              )}
            </Card>
          </div>

          {/* Right Sidebar - Analysis */}
          <div className="lg:col-span-3 space-y-6">
            {/* Height Control - For Free Fall Experiments */}
            {experimentType === 'freefall' && (
              <Card>
                <h3 className="font-bold text-lg text-gray-900 mb-4">⚙️ Experiment Setup</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Height: <span className="font-bold text-blue-600">{height}px</span>
                    </label>
                    <input
                      type="range"
                      min={20}
                      max={400}
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      disabled={simState.isRunning}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Set height before clicking Start
                    </p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">📐 Physics Formulas</h4>
                    <div className="space-y-1 text-sm text-gray-700 font-mono">
                      <div>v = gt</div>
                      <div>d = ½gt²</div>
                      <div>g = 9.8 m/s²</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Live Chart - Velocity vs Time */}
            <div ref={chartRef}>
              <LiveChart
                data={activeDataPoints}
                config={{
                  xKey: 'time',
                  yKey: 'velocity',
                  xLabel: 'Time (s)',
                  yLabel: 'Velocity (m/s)',
                  title: 'Velocity vs Time',
                  color: '#3b82f6',
                }}
              />
            </div>

            {/* Position Chart */}
            <LiveChart
              data={activeDataPoints}
              config={{
                xKey: 'time',
                yKey: 'position',
                xLabel: 'Time (s)',
                yLabel: 'Position (m)',
                title: 'Position vs Time',
                color: '#10b981',
              }}
            />

            {/* Export */}
            <Card>
              <h3 className="font-bold text-gray-900 mb-3">📊 Export Data</h3>
              <ExportBtn
                data={activeDataPoints}
                chartRef={chartRef}
                experimentName={experimentType}
              />
            </Card>

            {renderAnalysisPanels()}

            {/* Data Logger */}
            <DataLogger
              data={activeDataPoints}
              columns={['time', 'velocity', 'position', 'speed']}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
