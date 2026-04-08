'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen, Clock, BarChart3 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Tutorial {
  _id: string;
  experimentId: string;
  experimentName: string;
  category: string;
  description: string;
  difficulty: string;
  duration: number;
  objectives: string[];
  prerequisites?: string[];
  chapters: TutorialChapter[];
  relatedTopics?: string[];
  references?: Array<{
    title: string;
    url: string;
  }>;
}

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

export default function TutorialPage() {
  const params = useParams();
  const experimentId = params.experimentId as string;

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTutorial();
  }, [experimentId]);

  useEffect(() => {
    const syncTutorialProgress = async () => {
      if (!tutorial) return;

      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'tutorial_progress',
            tutorialId: tutorial.experimentId,
            experimentName: tutorial.experimentName,
            category: tutorial.category,
            totalChapters: tutorial.chapters.length,
            chapterNumber: currentChapter + 1,
            completed:
              tutorial.chapters.length > 0 &&
              currentChapter === tutorial.chapters.length - 1,
          }),
        });
      } catch (progressError) {
        console.error('Failed to sync tutorial progress:', progressError);
      }
    };

    syncTutorialProgress();
  }, [tutorial, currentChapter]);

  const fetchTutorial = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tutorials/${experimentId}`);
      const data = await response.json();

      if (data.success) {
        setTutorial(data.data);
        setCurrentChapter(0);
      } else {
        setError(data.error || 'Tutorial not found');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading tutorial...</p>
        </div>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Link href="/dashboard">
            <Button variant="primary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const chapter = tutorial.chapters[currentChapter];
  const difficultyColors: { [key: string]: string } = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  const categoryColors: { [key: string]: string } = {
    physics: 'bg-blue-100 text-blue-800',
    chemistry: 'bg-purple-100 text-purple-800',
    technology: 'bg-indigo-100 text-indigo-800',
  };

  const handleMarkTutorialComplete = async () => {
    if (!tutorial) return;

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'tutorial_progress',
          tutorialId: tutorial.experimentId,
          experimentName: tutorial.experimentName,
          category: tutorial.category,
          totalChapters: tutorial.chapters.length,
          chapterNumber: tutorial.chapters.length,
          completed: true,
        }),
      });
    } catch (progressError) {
      console.error('Failed to mark tutorial complete:', progressError);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ChevronLeft size={20} />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{tutorial.experimentName}</h1>
              <p className="text-gray-600 mt-1">{tutorial.description}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColors[tutorial.difficulty]}`}>
                {tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${categoryColors[tutorial.category]}`}>
                {tutorial.category.charAt(0).toUpperCase() + tutorial.category.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            {/* Info Cards */}
            <div className="space-y-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={20} className="text-blue-600" />
                  <span className="font-semibold text-gray-900">Duration</span>
                </div>
                <p className="text-gray-600">{tutorial.duration} minutes</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={20} className="text-purple-600" />
                  <span className="font-semibold text-gray-900">Chapters</span>
                </div>
                <p className="text-gray-600">{tutorial.chapters.length} chapters</p>
              </div>
            </div>

            {/* Objectives */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Learning Objectives</h3>
              <ul className="space-y-2">
                {tutorial.objectives.map((obj, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prerequisites */}
            {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Prerequisites</h3>
                <ul className="space-y-2">
                  {tutorial.prerequisites.map((prereq, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-yellow-600">→</span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Chapter Navigation */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-gray-900 mb-3">Chapters</h3>
              <div className="space-y-1">
                {tutorial.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentChapter(idx)}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      currentChapter === idx
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      Chapter {ch.chapterNumber}: {ch.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Chapter Header */}
              <div className="mb-8 pb-6 border-b">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Chapter {chapter.chapterNumber}: {chapter.title}
                </h2>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed mb-6">{chapter.content}</p>
              </div>

              {/* Key Points */}
              <div className="bg-blue-50 rounded-lg p-6 mb-8 border-l-4 border-blue-600">
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Key Points</h3>
                <ul className="space-y-2">
                  {chapter.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formula */}
              {chapter.formula && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8 border-l-4 border-purple-600">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Formula</h3>
                  <div className="bg-white rounded p-4 font-mono text-lg text-purple-600">
                    {chapter.formula}
                  </div>
                </div>
              )}

              {/* Visual Description */}
              {chapter.visualDescription && (
                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 mb-8 border-l-4 border-green-600">
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">Visual Representation</h3>
                  <p className="text-gray-700">{chapter.visualDescription}</p>
                </div>
              )}

              {/* Examples */}
              {chapter.examples && chapter.examples.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Examples</h3>
                  <div className="space-y-4">
                    {chapter.examples.map((example, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-l-4 border-orange-600">
                        <h4 className="font-bold text-gray-900 mb-2">{example.title}</h4>
                        <p className="text-gray-700 mb-3">{example.description}</p>
                        {example.calculation && (
                          <div className="bg-white rounded p-3 font-mono text-sm text-gray-700 whitespace-pre-wrap">
                            {example.calculation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Topics */}
              {tutorial.relatedTopics && tutorial.relatedTopics.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-3">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {tutorial.relatedTopics.map((topic, idx) => (
                      <span key={idx} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {tutorial.references && tutorial.references.length > 0 && (
                <div className="border-t pt-6 mb-8">
                  <h3 className="font-bold text-gray-900 mb-3">References</h3>
                  <ul className="space-y-2">
                    {tutorial.references.map((ref, idx) => (
                      <li key={idx}>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          {ref.title} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant={currentChapter === 0 ? 'ghost' : 'primary'}
                  disabled={currentChapter === 0}
                  onClick={() => setCurrentChapter(currentChapter - 1)}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft size={20} />
                  Previous
                </Button>
                <span className="text-gray-600 text-sm self-center">
                  Chapter {currentChapter + 1} of {tutorial.chapters.length}
                </span>
                <Button
                  variant={currentChapter === tutorial.chapters.length - 1 ? 'ghost' : 'primary'}
                  disabled={currentChapter === tutorial.chapters.length - 1}
                  onClick={() => setCurrentChapter(currentChapter + 1)}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={20} />
                </Button>
              </div>

              {currentChapter === tutorial.chapters.length - 1 && (
                <div className="mt-4 pt-4 border-t">
                  <Button variant="success" onClick={handleMarkTutorialComplete}>
                    Mark Tutorial Complete
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
