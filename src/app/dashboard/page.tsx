'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/Card';
import { 
  Plus, Beaker, Zap, Clock, Trash2, Eye, 
  BookOpen, FlaskConical, Atom, TrendingUp, 
  Award, Target, Flame, Droplets, Sparkles,
  GraduationCap, Play, ArrowRight, Star
} from 'lucide-react';
import { EXPERIMENT_TEMPLATES } from '@/lib/constants';

interface Experiment {
  _id: string;
  title: string;
  category: string;
  experimentType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'physics' | 'chemistry'>('all');
  const [activeTab, setActiveTab] = useState<'experiments' | 'tutorials'>('experiments');

  // Fetch user experiments
  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/experiments?userId=demo-user');
      const result = await response.json();
      
      if (result.success) {
        setExperiments(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experiment?')) return;

    try {
      const response = await fetch(`/api/experiments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExperiments((prev) => prev.filter((exp) => exp._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete experiment:', error);
      alert('Failed to delete experiment');
    }
  };

  const filteredExperiments =
    filter === 'all'
      ? experiments
      : experiments.filter((exp) => exp.category === filter);

  const templates = Object.entries(EXPERIMENT_TEMPLATES);
  const physicsTemplates = templates.filter(([_, t]) => t.category === 'physics');
  const chemistryTemplates = templates.filter(([_, t]) => t.category === 'chemistry');

  // Stats
  const totalExperiments = experiments.length;
  const completedExperiments = experiments.filter(e => e.status === 'completed').length;
  const physicsCount = experiments.filter(e => e.category === 'physics').length;
  const chemistryCount = experiments.filter(e => e.category === 'chemistry').length;

  // Get icon for experiment type
  const getExperimentIcon = (key: string, category: string) => {
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
    return icons[key] || (category === 'physics' ? <Zap className="text-blue-600" size={28} /> : <Beaker className="text-purple-600" size={28} />);
  };

  // Get difficulty badge
  const getDifficultyBadge = (key: string) => {
    const difficulties: Record<string, { level: string; color: string }> = {
      freefall: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      acidbase: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      pendulum: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      projectilemotion: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
      collision: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
      titration: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
      electrolysis: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
      flametest: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      crystallization: { level: 'Beginner', color: 'bg-green-100 text-green-700' },
      displacement: { level: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
    };
    const diff = difficulties[key] || { level: 'Beginner', color: 'bg-green-100 text-green-700' };
    return <span className={`text-xs font-semibold px-2 py-1 rounded-full ${diff.color}`}>{diff.level}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FlaskConical className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SimuLab Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Your virtual science laboratory
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/tutorials/freefall">
                <Button variant="ghost" size="sm" leftIcon={<BookOpen size={16} />}>
                  Tutorials
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="sm">← Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FlaskConical className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalExperiments}</p>
                  <p className="text-sm text-gray-500">Total Experiments</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Award className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{completedExperiments}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Zap className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{physicsCount}</p>
                  <p className="text-sm text-gray-500">Physics Labs</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <Beaker className="text-pink-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{chemistryCount}</p>
                  <p className="text-sm text-gray-500">Chemistry Labs</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="mb-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('experiments')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'experiments'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <FlaskConical size={16} />
                Experiments
              </span>
            </button>
            <button
              onClick={() => setActiveTab('tutorials')}
              className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'tutorials'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <GraduationCap size={16} />
                Tutorials
              </span>
            </button>
          </div>
        </section>

        {/* Physics Experiments Section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Physics Experiments</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {physicsTemplates.length} available
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {physicsTemplates.map(([key, template]) => (
              <div
                key={key}
                className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform">
                    {getExperimentIcon(key, 'physics')}
                  </div>
                  {getDifficultyBadge(key)}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
                <div className="flex gap-2">
                  <Link href={`/lab/${key}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      <Play size={14} />
                      {activeTab === 'experiments' ? 'Start Lab' : 'Start'}
                    </button>
                  </Link>
                  <Link href={`/tutorials/${key}`}>
                    <button className="p-2 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-colors">
                      <BookOpen size={16} className="text-gray-600" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chemistry Experiments Section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Beaker className="text-purple-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Chemistry Experiments</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {chemistryTemplates.length} available
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {chemistryTemplates.map(([key, template]) => (
              <div
                key={key}
                className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl group-hover:scale-110 transition-transform">
                    {getExperimentIcon(key, 'chemistry')}
                  </div>
                  {getDifficultyBadge(key)}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
                <div className="flex gap-2">
                  <Link href={`/lab/${key}`} className="flex-1">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors">
                      <Play size={14} />
                      {activeTab === 'experiments' ? 'Start Lab' : 'Start'}
                    </button>
                  </Link>
                  <Link href={`/tutorials/${key}`}>
                    <button className="p-2 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition-colors">
                      <BookOpen size={16} className="text-gray-600" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Tutorial Banner */}
        <section className="mb-10">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-yellow-300" size={20} fill="currentColor" />
                  <span className="text-sm font-semibold text-white/80">Featured</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">New to SimuLab?</h3>
                <p className="text-white/80 max-w-md">
                  Start with our beginner-friendly Free Fall tutorial to learn the basics of physics simulations.
                </p>
              </div>
              <Link href="/tutorials/freefall">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                  Start Learning
                  <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Saved Experiments */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="text-amber-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Your Saved Experiments</h2>
            </div>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('physics')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === 'physics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Physics
              </button>
              <button
                onClick={() => setFilter('chemistry')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  filter === 'chemistry' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Chemistry
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading your experiments...</p>
            </div>
          ) : filteredExperiments.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No experiments saved yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start your scientific journey by running an experiment from the templates above. Your progress will be saved here.
                </p>
                <Link href="/lab/freefall">
                  <Button variant="primary" leftIcon={<Play size={16} />}>
                    Start Your First Experiment
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredExperiments.map((exp) => (
                <div key={exp._id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {exp.category === 'physics' ? (
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="text-blue-600" size={18} />
                        </div>
                      ) : (
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Beaker className="text-purple-600" size={18} />
                        </div>
                      )}
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {exp.category}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        exp.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {exp.status === 'completed' ? '✓ Completed' : '⏳ In Progress'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2">{exp.title}</h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Clock size={14} />
                    <span>
                      {new Date(exp.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Link href={`/lab/${exp.experimentType}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        leftIcon={<Eye size={14} />}
                      >
                        Continue
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleDelete(exp._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            SimuLab - Interactive Science Simulations for Education
          </p>
          <p className="text-gray-400 text-xs mt-2">
            © 2026 SimuLab. Learn science through virtual experiments.
          </p>
        </div>
      </footer>
    </div>
  );
}