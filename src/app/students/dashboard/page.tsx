'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId?: string;
  institution?: string;
  grade?: string;
  createdAt: string;
}

export default function StudentsDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    institution: '',
    grade: '',
  });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
      return;
    }
    setCurrentUser(JSON.parse(user));
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      const data = await response.json();

      if (data.success) {
        setStudents(data.data);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  const handleEdit = (student: Student) => {
    setEditingId(student._id);
    setEditForm({
      name: student.name,
      institution: student.institution || '',
      grade: student.grade || '',
    });
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/students/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (data.success) {
        setEditingId(null);
        fetchStudents();
      } else {
        setError(data.error || 'Failed to update student');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchStudents();
      } else {
        setError(data.error || 'Failed to delete student');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!currentUser) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, {currentUser.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={() => setError('')}
              className="float-right font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            + Add New Student
          </Link>
          <button
            onClick={fetchStudents}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Refresh
          </button>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="text-center text-gray-600">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No students found. Start by adding a new student.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Student ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Institution</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Grade</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {editingId === student._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{student.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-gray-600">{student.studentId || '-'}</td>
                    <td className="px-6 py-4">
                      {editingId === student._id ? (
                        <input
                          type="text"
                          value={editForm.institution}
                          onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      ) : (
                        <span className="text-gray-600">{student.institution || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === student._id ? (
                        <input
                          type="text"
                          value={editForm.grade}
                          onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                          className="w-full px-2 py-1 border rounded"
                        />
                      ) : (
                        <span className="text-gray-600">{student.grade || '-'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {editingId === student._id ? (
                        <>
                          <button
                            onClick={handleUpdate}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-600 hover:text-gray-700 font-medium"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">Total Students: {students.length}</p>
        </div>
      </main>
    </div>
  );
}
