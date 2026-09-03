'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = () => {
    api.getNotifications()
      .then((data: any) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const markAllRead = async () => {
    await api.markAllRead();
    fetchNotes();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Notifications</h1>
          <p className="text-gray-400 text-sm">Real-time status updates and admin announcements</p>
        </div>
        {items.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="btn-secondary text-xs">
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-4xl mb-3">🔔</div>
          <h3 className="text-base font-semibold text-white mb-1">No notifications yet</h3>
          <p className="text-xs text-gray-400">You will receive alerts here when your problem reports receive status updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all ${
                n.isRead ? 'glass border-white/5 opacity-80' : 'bg-cyan-500/5 border-cyan-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="text-xl">📢</span>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{n.title}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-gray-500 block mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                {n.problemId && (
                  <Link
                    href={`/dashboard/my-problems/${n.problemId}`}
                    className="text-xs text-cyan-400 hover:text-cyan-300 whitespace-nowrap flex-shrink-0"
                  >
                    View Problem →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
