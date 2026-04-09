'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { CalendarDays, ClipboardList, GraduationCap, PlusCircle, Users } from 'lucide-react';

interface AssignmentTargetStudent {
  id: string;
  name: string;
  email: string;
  classKey?: string | null;
  classLabel: string;
}

interface AssignmentTargetClass {
  key: string;
  label: string;
  studentCount: number;
}

interface AssignmentSourceOption {
  id: string;
  name: string;
  category: string;
}

interface AssignmentAnalytics {
  assignedCount: number;
  startedCount: number;
  completedCount: number;
  submittedCount: number;
  completionRate: number;
  submissionRate: number;
  averageCompletion: number;
  classPerformance: Array<{
    classKey: string;
    assignedCount: number;
    startedCount: number;
    completedCount: number;
    submittedCount: number;
    averageCompletion: number;
  }>;
}

interface AssignmentRecord {
  _id: string;
  title: string;
  description?: string;
  sourceType: 'lab' | 'tutorial';
  sourceId: string;
  sourceName: string;
  sourceCategory: string;
  dueDate: string;
  assignedClasses: string[];
  assignedStudentIds: string[];
  createdByName: string;
  analytics: AssignmentAnalytics;
}

interface AssignmentManagerProps {
  creatorRole: 'teacher' | 'admin';
}

export default function AssignmentManager({ creatorRole }: AssignmentManagerProps) {
  const [students, setStudents] = useState<AssignmentTargetStudent[]>([]);
  const [classes, setClasses] = useState<AssignmentTargetClass[]>([]);
  const [labs, setLabs] = useState<AssignmentSourceOption[]>([]);
  const [tutorials, setTutorials] = useState<AssignmentSourceOption[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sourceType, setSourceType] = useState<'lab' | 'tutorial'>('lab');
  const [sourceId, setSourceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [error, setError] = useState('');

  const sourceOptions = sourceType === 'lab' ? labs : tutorials;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [targetsResponse, assignmentsResponse] = await Promise.all([
          fetch('/api/assignments/targets'),
          fetch('/api/assignments'),
        ]);

        const targetsResult = await targetsResponse.json();
        const assignmentsResult = await assignmentsResponse.json();

        if (!targetsResponse.ok || !targetsResult.success) {
          throw new Error(targetsResult.error || 'Failed to load assignment targets');
        }

        if (!assignmentsResponse.ok || !assignmentsResult.success) {
          throw new Error(assignmentsResult.error || 'Failed to load assignments');
        }

        setStudents(targetsResult.data.students);
        setClasses(targetsResult.data.classes);
        setLabs(targetsResult.data.labs);
        setTutorials(targetsResult.data.tutorials);
        setAssignments(assignmentsResult.data);

        const defaultLab = targetsResult.data.labs[0];
        if (defaultLab) {
          setSourceId(defaultLab.id);
          setTitle(`${defaultLab.name} Assignment`);
        }
      } catch (fetchError: any) {
        setError(fetchError.message || 'Failed to load assignment manager');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!sourceOptions.length) {
      setSourceId('');
      return;
    }

    const selectedSource = sourceOptions.find((option) => option.id === sourceId) || sourceOptions[0];
    setSourceId(selectedSource.id);
    setTitle((current) => (current.trim() ? current : `${selectedSource.name} Assignment`));
  }, [sourceType, sourceOptions, sourceId]);

  const groupedStudents = useMemo(() => {
    return students.reduce<Record<string, AssignmentTargetStudent[]>>((acc, student) => {
      const key = student.classLabel || 'No class assigned';
      if (!acc[key]) acc[key] = [];
      acc[key].push(student);
      return acc;
    }, {});
  }, [students]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const toggleClass = (classKey: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classKey) ? prev.filter((key) => key !== classKey) : [...prev, classKey]
    );
  };

  const handleCreateAssignment = async () => {
    setError('');

    if (!sourceId || !dueDate) {
      setError('Please choose a source and deadline.');
      return;
    }

    if (selectedStudentIds.length === 0 && selectedClasses.length === 0) {
      setError('Choose at least one student or class.');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          sourceType,
          sourceId,
          dueDate,
          assignedStudentIds: selectedStudentIds,
          assignedClasses: selectedClasses,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create assignment');
      }

      const refreshed = await fetch('/api/assignments');
      const refreshedResult = await refreshed.json();
      if (refreshed.ok && refreshedResult.success) {
        setAssignments(refreshedResult.data);
      }

      setDescription('');
      setSelectedStudentIds([]);
      setSelectedClasses([]);
      setDueDate('');
    } catch (createError: any) {
      setError(createError.message || 'Failed to create assignment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignment Workflow</h1>
            <p className="mt-2 text-gray-600">
              Create assignments from labs or tutorials, set deadlines, and track student and class progress.
            </p>
          </div>
          <Link href={creatorRole === 'admin' ? '/admin/dashboard' : '/instructor/dashboard'}>
            <Button variant="outline" size="sm">Back to Dashboard</Button>
          </Link>
        </div>

        {loading ? (
          <Card className="text-center py-12 text-gray-500">Loading assignments...</Card>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
              <Card className="border border-gray-100 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl bg-blue-100 p-2">
                    <PlusCircle className="text-blue-600" size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Create Assignment</h2>
                    <p className="text-sm text-gray-500">Keep it simple: pick a source, deadline, and audience.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={sourceType === 'lab' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSourceType('lab')}
                    >
                      Lab
                    </Button>
                    <Button
                      type="button"
                      variant={sourceType === 'tutorial' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSourceType('tutorial')}
                    >
                      Tutorial
                    </Button>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Source</label>
                    <select
                      value={sourceId}
                      onChange={(event) => setSourceId(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      {sourceOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name} ({option.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      placeholder="Optional teacher note for students"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Deadline</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Users size={16} />
                        Assign to Classes
                      </div>
                      <div className="max-h-52 space-y-2 overflow-auto rounded-xl border border-gray-200 p-3">
                        {classes.length === 0 ? (
                          <p className="text-sm text-gray-500">No class groups found yet.</p>
                        ) : (
                          classes.map((classGroup) => (
                            <label key={classGroup.key} className="flex items-start gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={selectedClasses.includes(classGroup.key)}
                                onChange={() => toggleClass(classGroup.key)}
                                className="mt-1"
                              />
                              <span>
                                {classGroup.label}
                                <span className="block text-xs text-gray-500">
                                  {classGroup.studentCount} students
                                </span>
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <GraduationCap size={16} />
                        Assign to Students
                      </div>
                      <div className="max-h-52 space-y-3 overflow-auto rounded-xl border border-gray-200 p-3">
                        {Object.entries(groupedStudents).map(([group, groupStudents]) => (
                          <div key={group}>
                            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                              {group}
                            </div>
                            <div className="space-y-2">
                              {groupStudents.map((student) => (
                                <label key={student.id} className="flex items-start gap-2 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudentIds.includes(student.id)}
                                    onChange={() => toggleStudent(student.id)}
                                    className="mt-1"
                                  />
                                  <span>
                                    {student.name}
                                    <span className="block text-xs text-gray-500">{student.email}</span>
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <Button
                    onClick={handleCreateAssignment}
                    isLoading={saving}
                    leftIcon={<CalendarDays size={16} />}
                    className="w-full"
                  >
                    Create Assignment
                  </Button>
                </div>
              </Card>

              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-white border border-gray-100">
                    <p className="text-sm text-gray-500">Created Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
                  </Card>
                  <Card className="bg-white border border-gray-100">
                    <p className="text-sm text-gray-500">Tracked Students</p>
                    <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                  </Card>
                  <Card className="bg-white border border-gray-100">
                    <p className="text-sm text-gray-500">Class Groups</p>
                    <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                  </Card>
                </div>

                <Card className="border border-gray-100 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-amber-100 p-2">
                      <ClipboardList className="text-amber-700" size={18} />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">Assignment Tracking</h2>
                      <p className="text-sm text-gray-500">Completion, submission, and class-level performance.</p>
                    </div>
                  </div>

                  {assignments.length === 0 ? (
                    <p className="text-sm text-gray-500">No assignments created yet.</p>
                  ) : (
                    <div className="space-y-5">
                      {assignments.map((assignment) => (
                        <div key={assignment._id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900">{assignment.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {assignment.sourceType === 'lab' ? 'Lab' : 'Tutorial'}: {assignment.sourceName}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                Due {new Date(assignment.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>Assigned: {assignment.analytics.assignedCount}</div>
                              <div>Started: {assignment.analytics.startedCount}</div>
                              <div>Completed: {assignment.analytics.completedCount}</div>
                              <div>Submitted: {assignment.analytics.submittedCount}</div>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl bg-white border border-gray-100 p-3">
                              <p className="text-sm text-gray-500">Completion Rate</p>
                              <p className="text-xl font-bold text-gray-900">
                                {assignment.analytics.completionRate.toFixed(1)}%
                              </p>
                            </div>
                            <div className="rounded-xl bg-white border border-gray-100 p-3">
                              <p className="text-sm text-gray-500">Submission Rate</p>
                              <p className="text-xl font-bold text-gray-900">
                                {assignment.analytics.submissionRate.toFixed(1)}%
                              </p>
                            </div>
                            <div className="rounded-xl bg-white border border-gray-100 p-3">
                              <p className="text-sm text-gray-500">Average Progress</p>
                              <p className="text-xl font-bold text-gray-900">
                                {assignment.analytics.averageCompletion.toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          {assignment.analytics.classPerformance.length > 0 ? (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Class Performance</h4>
                              <div className="grid gap-3 md:grid-cols-2">
                                {assignment.analytics.classPerformance.map((classEntry) => (
                                  <div key={classEntry.classKey} className="rounded-xl border border-gray-100 bg-white p-3 text-sm">
                                    <div className="font-semibold text-gray-900">{classEntry.classKey === 'unassigned' ? 'No class assigned' : classEntry.classKey.replace('__', ' - ')}</div>
                                    <div className="text-gray-600 mt-1">
                                      {classEntry.completedCount}/{classEntry.assignedCount} completed
                                    </div>
                                    <div className="text-gray-600">
                                      {classEntry.submittedCount}/{classEntry.assignedCount} submitted
                                    </div>
                                    <div className="text-gray-600">
                                      Avg progress {classEntry.averageCompletion.toFixed(1)}%
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
