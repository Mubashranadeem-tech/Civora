'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Bell, Megaphone, ArrowRight } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-2 border-b border-[#E2EBE0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Notifications</h1>
          <p className="text-sm text-[#546E5E]">Real-time status alerts, AI updates, and administrative announcements.</p>
        </div>
        {items.some(n => !n.isRead) && (
          <button onClick={markAllRead} className="btn-secondary text-xs px-4 py-2 rounded-xl self-start sm:self-auto">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-16 text-center bg-white border border-[#DCE5DA]">
          <Bell className="w-10 h-10 text-[#718D7D] mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#14261C] mb-1">No notifications yet</h3>
          <p className="text-xs text-[#5D7666]">You will receive alerts here whenever your submitted problem reports receive updates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all ${
                n.isRead
                  ? 'bg-white border-[#E2EAE0] opacity-85 shadow-xs'
                  : 'bg-[#F4FAF2] border-[#CADDC8] shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#D5E4D3] flex items-center justify-center text-[#235837] flex-shrink-0 shadow-xs">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[#14261C]">{n.title}</h4>
                      {!n.isRead && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#1C4830] text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4A6454] leading-relaxed font-medium">{n.message}</p>
                    <span className="text-[11px] text-[#718C7C] block mt-2 font-mono">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {n.problemId && (
                  <Link
                    href={`/dashboard/my-problems/${n.problemId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F5434] bg-[#EBF4E8] hover:bg-[#D7EBD4] border border-[#CDE3CB] px-3.5 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 transition-all shadow-xs"
                  >
                    View Report
                    <ArrowRight className="w-3 h-3" />
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
