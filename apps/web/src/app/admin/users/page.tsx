'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers()
      .then((data: any) => setUsersList(Array.isArray(data) ? data : []))
      .catch(() => setUsersList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-2 border-b border-[#E2EBE0]">
        <h1 className="text-2xl font-extrabold text-[#13251A] tracking-tight">Citizen & Staff Directory</h1>
        <p className="text-sm text-[#546E5E]">Inspect registered platform participants, submitters, and administrators.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : (
        <div className="glass-card overflow-hidden bg-white border border-[#DCE5DA] shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EAF0E8] bg-[#F7FAF6] text-[11px] font-bold uppercase tracking-wider text-[#4E6857]">
                <th className="px-5 py-3.5">User / Submitter</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">City</th>
                <th className="px-5 py-3.5">Total Reports</th>
                <th className="px-5 py-3.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF3EC]">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-[#F3F7F2] transition-colors text-sm">
                  <td className="px-5 py-4">
                    <div className="font-bold text-[#14261C]">{u.name}</div>
                    <div className="text-xs text-[#637C6D]">{u.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-[#EBF5EA] text-[#1D5432] border border-[#CCE2CA]'
                        : 'bg-[#F2F6F1] text-[#3A5645] border border-[#DEE7DD]'
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-[#14261C]">{u.city || 'Islamabad'}</td>
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[#1D5432]">{u.problemsCount || 0}</td>
                  <td className="px-5 py-4 text-xs text-[#657F70] font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
