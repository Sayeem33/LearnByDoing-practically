'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { Beaker, Zap, BookOpen, TrendingUp, Users, Award } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Zap className="text-blue-600" size={32} />,
      title: 'Physics Simulations',
      description: 'Explore mechanics, motion, and energy through interactive experiments',
    },
    {
      icon: <Beaker className="text-purple-600" size={32} />,
      title: 'Chemistry Lab',
      description: 'Mix chemicals, observe reactions, and understand molecular interactions',
    },
    {
      icon: <TrendingUp className="text-green-600" size={32} />,
      title: 'Real-time Analysis',
      description: 'Collect data, generate graphs, and export results for further study',
    },
    {
      icon: <BookOpen className="text-orange-600" size={32} />,
      title: 'Learn by Doing',
      description: 'Interactive tutorials guide you through each experiment step-by-step',
    },
    {
      icon: <Users className="text-cyan-600" size={32} />,
      title: 'Collaborative',
      description: 'Share experiments with classmates and teachers',
    },
    {
      icon: <Award className="text-red-600" size={32} />,
      title: 'Academic Grade',
      description: 'Designed for school curricula from grade 8 to undergraduate level',
    },
  ];

  const experiments = [
    {
      name: 'Free Fall',
      category: 'Physics',
      image: '🎯',
      description: 'Study acceleration due to gravity',
    },
    {
      name: 'Projectile Motion',
      category: 'Physics',
      image: '🚀',
      description: 'Analyze parabolic trajectories',
    },
    {
      name: 'Simple Pendulum',
      category: 'Physics',
      image: '⏱️',
      description: 'Explore periodic motion',
    },
    {
      name: 'Acid-Base Reaction',
      category: 'Chemistry',
      image: '🧪',
      description: 'Observe neutralization',
    },
    {
      name: 'Titration',
      category: 'Chemistry',
      image: '⚗️',
      description: 'Determine concentration',
    },
    {
      name: 'Gas Laws',
      category: 'Chemistry',
      image: '💨',
      description: 'Study PV=nRT relationships',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Beaker className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SimuLab
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/students/dashboard">
                <Button variant="ghost">Student Dashboard</Button>
              </Link>
              <Link href="/lab/new">
                <Button variant="primary">Start Lab</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Virtual Science Laboratory
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience physics and chemistry through interactive simulations.
            Learn by doing, not just reading. Perfect for students and educators.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/lab/new">
              <Button size="lg" variant="primary" leftIcon={<Zap size={20} />}>
                Start Experimenting
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" leftIcon={<BookOpen size={20} />}>
                View Tutorials
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose SimuLab?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Card key={idx} hover padding="lg">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      {/* Experiments Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Popular Experiments
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Choose from our library of ready-to-use experiments
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map((exp, idx) => (
            <Card key={idx} hover padding="lg">
              <div className="text-5xl mb-4">{exp.image}</div>
              <CardTitle className="text-lg mb-2">{exp.name}</CardTitle>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-3">
                {exp.category}
              </div>
              <CardDescription className="mb-4">{exp.description}</CardDescription>
              <Link href={`/lab/new?type=${exp.name.toLowerCase().replace(' ', '')}`}>
                <Button size="sm" variant="outline" className="w-full">
                  Try Now
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students exploring science through SimuLab
          </p>
          <Link href="/lab/new">
            <Button size="xl" variant="glass">
              Launch Your First Experiment
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Beaker className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-white">SimuLab</span>
          </div>
          <p className="text-sm">
            Virtual Science Laboratory &copy; 2024. Built with Next.js, Matter.js, and MongoDB.
          </p>
        </div>
      </footer>
    </div>
  );
}