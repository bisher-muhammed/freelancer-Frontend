'use client';

import { useState, useEffect } from 'react';
import { apiPrivate } from '@/lib/apiPrivate';
import {
  CheckCircle2,
  User,
  Calendar,
  Search,
  FolderOpen,
  ChevronRight,
  Award,
} from 'lucide-react';
import Link from 'next/link';

export default function CompletedProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await apiPrivate.get('completed-projects/');
        // Handle both paginated {results:[...]} and plain array responses
        const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch completed projects:', err);
        setError('Failed to load completed projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filtered = projects.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.freelancer?.username?.toLowerCase().includes(search.toLowerCase()) ||
    p.freelancer?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ── Skeleton ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="lg:ml-0 pt-16 lg:mr-4 w-full min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-4/5 mb-4" />
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-100 rounded w-28" />
                  <div className="h-4 bg-gray-100 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="lg:ml-0 pt-16 w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-7 h-7 text-red-400" />
          </div>
          <p className="text-gray-700 font-medium mb-2">Something went wrong</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:ml-0 pt-16 lg:mr-4 w-full min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Completed Projects</h1>
            </div>
            <p className="text-gray-500 text-sm">
              {projects.length} project{projects.length !== 1 ? 's' : ''} delivered successfully
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <input
              type="text"
              placeholder="Search projects or freelancers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-black"
            />
          </div>
        </div>

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="font-semibold text-gray-700">
              {search ? 'No results found' : 'No completed projects yet'}
            </p>
            <p className="text-gray-400 text-sm max-w-xs">
              {search
                ? 'Try a different search term.'
                : 'Projects you complete with freelancers will appear here.'}
            </p>
            {!search && (
              <Link
                href="/client/projects"
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                View active projects →
              </Link>
            )}
          </div>
        )}

        {/* ── Project list ────────────────────────────────────────────── */}
        <div className="space-y-4">
          {filtered.map((project, index) => (
            <div
              key={project.id}
              className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">

                  {/* Left — title + description + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h2 className="text-base font-semibold text-gray-900 leading-snug">
                        {project.title}
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100 flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {project.description}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">

                      {/* Freelancer */}
                      {project.freelancer ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 text-gray-500" />
                          </div>
                          <span>
                            <span className="text-gray-400">Freelancer: </span>
                            <span className="font-medium text-gray-700">
                              {project.freelancer.full_name || project.freelancer.username}
                            </span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <User className="w-3.5 h-3.5" />
                          <span>No freelancer info</span>
                        </div>
                      )}

                      {/* Completed date */}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>
                          <span className="text-gray-400">Completed: </span>
                          <span className="font-medium text-gray-700">
                            {fmt(project.completed_at)}
                          </span>
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Right — view link */}
                  <div className="flex-shrink-0 self-center">
                    <Link
                      href={`/client/projects/${project.id}`}
                      className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-700 transition-colors font-medium whitespace-nowrap"
                    >
                      View
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Emerald accent bar slides in on hover */}
              <div className="h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}