'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  Atom,
  BarChart3,
  Beaker,
  BookOpen,
  Clock,
  Droplets,
  Flame,
  FlaskConical,
  GraduationCap,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface Tutorial {
  _id: string;
  experimentId: string;
  experimentName: string;
  category: 'physics' | 'chemistry';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  chapters: Array<{ chapterNumber: number; title: string }>;
}

const getTutorialIcon = (experimentId: string, category: Tutorial['category']) => {
  const icons: Record<string, React.ReactNode> = {
    freefall: <Droplets className="text-blue-500" size={28} />,
    projectilemotion: <Target className="text-red-500" size={28} />,
    pendulum: <Atom className="text-purple-500" size={28} />,
    collision: <Sparkles className="text-amber-500" size={28} />,
    acidbase: <FlaskConical className="text-green-500" size={28} />,
    titration: <Beaker className="text-pink-500" size={28} />,
    electrolysis: <Zap className="text-yellow-500" size={28} />,
    flametest: <Flame className="text-orange-500" size={28} />,
    crystallization: <Sparkles className="text-cyan-500" size={28} />,
    displacement: <TrendingUp className="text-indigo-500" size={28} />,
  };

  return icons[experimentId] || (
    category === 'physics'
      ? <Zap className="text-blue-600" size={28} />
      : <Beaker className="text-purple-600" size={28} />
  );
};

const getDifficultyBadge = (difficulty: Tutorial['difficulty']) => {
  const styles = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles[difficulty]}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
};

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'physics' | 'chemistry'>('all');

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tutorials');
        const result = await response.json();

        if (result.success) {
          setTutorials(result.data);
        } else {
          setError(result.error || 'Failed to fetch tutorials');
        }
      } catch (fetchError: any) {
        setError(fetchError.message || 'Failed to fetch tutorials');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  const filteredTutorials =
    filter === 'all'
      ? tutorials
      : tutorials.filter((tutorial) => tutorial.category === filter);

  const physicsTutorials = filteredTutorials.filter((tutorial) => tutorial.category === 'physics');
  const chemistryTutorials = filteredTutorials.filter((tutorial) => tutorial.category === 'chemistry');
  const beginnerCount = tutorials.filter((tutorial) => tutorial.difficulty === 'beginner').length;

  const renderTutorialSection = (
    title: string,
    count: number,
    tutorialsByCategory: Tutorial[],
    colorClasses: {
      iconBg: string;
      iconText: string;
      cardBorder: string;
      cardHover: string;
      button: string;
      buttonHover: string;
      buttonBorder: string;
      buttonBg: string;
    },
    sectionIcon: React.ReactNode
  ) => {
    if (tutorialsByCategory.length === 0) return null;

    return (
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-2 rounded-lg ${colorClasses.iconBg}`}>
            <div className={colorClasses.iconText}>{sectionIcon}</div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {count} available
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tutorialsByCategory.map((tutorial) => (
            <div
              key={tutorial._id}
              className={`group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-300 ${colorClasses.cardHover} ${colorClasses.cardBorder}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl group-hover:scale-110 transition-transform ${colorClasses.iconBg}`}>
                  {getTutorialIcon(tutorial.experimentId, tutorial.category)}
                </div>
                {getDifficultyBadge(tutorial.difficulty)}
              </div>

              <h3 className="font-bold text-gray-900 mb-1">{tutorial.experimentName}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">{tutorial.description}</p>

              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{tutorial.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} />
                  <span>{tutorial.chapters.length} chapters</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/tutorials/${tutorial.experimentId}`} className="flex-1">
                  <button className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-white text-sm font-semibold rounded-lg transition-colors ${colorClasses.button} ${colorClasses.buttonHover}`}>
                    <BookOpen size={14} />
                    Open Tutorial
                  </button>
                </Link>
                <Link href={`/lab/${tutorial.experimentId}`}>
                  <button className={`p-2 border rounded-lg transition-colors ${colorClasses.buttonBorder} ${colorClasses.buttonBg}`}>
                    <Play size={16} className="text-gray-600" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
                <GraduationCap className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  SimuLab Tutorials
                </h1>
                <p className="text-sm text-gray-500">
                  Browse every guided lesson in one place
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={16} />}>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <BookOpen className="text-indigo-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{tutorials.length}</p>
                  <p className="text-sm text-gray-500">Total Tutorials</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <GraduationCap className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{beginnerCount}</p>
                  <p className="text-sm text-gray-500">Beginner Friendly</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Zap className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {tutorials.filter((tutorial) => tutorial.category === 'physics').length}
                  </p>
                  <p className="text-sm text-gray-500">Physics Tutorials</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Beaker className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {tutorials.filter((tutorial) => tutorial.category === 'chemistry').length}
                  </p>
                  <p className="text-sm text-gray-500">Chemistry Tutorials</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all text-gray-600 hover:text-gray-900"
            >
              <span className="flex items-center gap-2">
                <FlaskConical size={16} />
                Experiments
              </span>
            </Link>
            <button className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-all bg-white text-blue-600 shadow-sm">
              <span className="flex items-center gap-2">
                <GraduationCap size={16} />
                Tutorials
              </span>
            </button>
          </div>
        </section>

        <section className="mb-8">
          <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-100 shadow-sm w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('physics')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                filter === 'physics' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Physics
            </button>
            <button
              onClick={() => setFilter('chemistry')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                filter === 'chemistry' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chemistry
            </button>
          </div>
        </section>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading tutorials...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-8 text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        ) : filteredTutorials.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No tutorials found</h3>
            <p className="text-gray-500">
              Try switching the filter or seed the tutorials if the database is still empty.
            </p>
          </div>
        ) : (
          <>
            {renderTutorialSection(
              'Physics Tutorials',
              physicsTutorials.length,
              physicsTutorials,
              {
                iconBg: 'bg-blue-50',
                iconText: 'text-blue-600',
                cardBorder: 'hover:border-blue-200',
                cardHover: 'hover:shadow-lg',
                button: 'bg-blue-600',
                buttonHover: 'hover:bg-blue-700',
                buttonBorder: 'border-blue-100 hover:border-blue-300',
                buttonBg: 'hover:bg-blue-50',
              },
              <Zap size={20} />
            )}

            {renderTutorialSection(
              'Chemistry Tutorials',
              chemistryTutorials.length,
              chemistryTutorials,
              {
                iconBg: 'bg-purple-50',
                iconText: 'text-purple-600',
                cardBorder: 'hover:border-purple-200',
                cardHover: 'hover:shadow-lg',
                button: 'bg-purple-600',
                buttonHover: 'hover:bg-purple-700',
                buttonBorder: 'border-purple-100 hover:border-purple-300',
                buttonBg: 'hover:bg-purple-50',
              },
              <Beaker size={20} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
