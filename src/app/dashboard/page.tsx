'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/Card';
import { Plus, Beaker, Zap, Clock, Trash2, Eye } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage your experiments and explore new simulations
              </p>
            </div>
            <Link href="/">
              <Button variant="ghost">← Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Start Templates */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Start a New Experiment
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(([key, template]) => (
              <Card key={key} hover padding="lg">
                <div className="flex items-center gap-3 mb-3">
                  {template.category === 'physics' ? (
                    <Zap className="text-blue-600" size={32} />
                  ) : (
                    <Beaker className="text-purple-600" size={32} />
                  )}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {template.category}
                    </span>
                  </div>
                </div>
                <CardDescription className="mb-4">
                  {template.description}
                </CardDescription>
                <div className="space-y-2">
                  <Link href={`/lab/${key}`}>
                    <Button variant="primary" size="sm" className="w-full">
                      Start Experiment
                    </Button>
                  </Link>
                  <Link href={`/tutorials/${key}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Saved Experiments */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Saved Experiments
            </h2>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'physics' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('physics')}
              >
                Physics
              </Button>
              <Button
                variant={filter === 'chemistry' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('chemistry')}
              >
                Chemistry
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-600">Loading experiments...</p>
            </div>
          ) : filteredExperiments.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-12">
                <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No experiments yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start your first experiment from the templates above
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiments.map((exp) => (
                <Card key={exp._id} hover padding="lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {exp.category === 'physics' ? (
                        <Zap className="text-blue-600" size={24} />
                      ) : (
                        <Beaker className="text-purple-600" size={24} />
                      )}
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {exp.category}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        exp.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {exp.status}
                    </span>
                  </div>

                  <CardTitle className="text-lg mb-2">{exp.title}</CardTitle>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Clock size={14} />
                    <span>
                      {new Date(exp.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <CardFooter className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Link href={`/lab/${exp.experimentType}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        leftIcon={<Eye size={16} />}
                      >
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(exp._id)}
                      leftIcon={<Trash2 size={16} />}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}