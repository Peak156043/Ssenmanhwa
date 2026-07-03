'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2, Ban, CheckCircle, Search } from 'lucide-react';
import { toggleBanUserAction, deleteUserAction } from '@/lib/actions/admin-users';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface User {
  id: string;
  username: string;
  is_banned: boolean;
  created_at: string;
}

export function UsersTable({ users, adminRole }: { users: User[]; adminRole: string }) {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'ban' | 'delete' | null;
    targetId: string | null;
    isBanned?: boolean;
  }>({ isOpen: false, type: null, targetId: null });

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleBan = async () => {
    if (!modalState.targetId) return;
    setLoading(true);
    await toggleBanUserAction(modalState.targetId, modalState.isBanned || false);
    setLoading(false);
    setModalState({ isOpen: false, type: null, targetId: null });
  };

  const handleDelete = async () => {
    if (!modalState.targetId) return;
    setLoading(true);
    await deleteUserAction(modalState.targetId);
    setLoading(false);
    setModalState({ isOpen: false, type: null, targetId: null });
  };

  return (
    <div className="space-y-4">
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.type === 'delete' ? 'ยืนยันการลบผู้ใช้' : (modalState.isBanned ? 'ยืนยันการปลดแบน' : 'ยืนยันการแบนผู้ใช้')}
        description={modalState.type === 'delete' 
          ? 'การกระทำนี้จะไม่สามารถกู้คืนได้ และข้อมูลผู้ใช้จะถูกลบออกจากระบบอย่างถาวร' 
          : (modalState.isBanned ? 'ผู้ใช้นี้จะสามารถกลับมาล็อกอินเข้าสู่ระบบได้ตามปกติ' : 'ผู้ใช้นี้จะไม่สามารถล็อกอินเข้าสู่ระบบเว็บไซต์ได้อีก')}
        confirmText={modalState.type === 'delete' ? 'ลบถาวร' : (modalState.isBanned ? 'ปลดแบน' : 'แบน')}
        isLoading={loading}
        onConfirm={modalState.type === 'delete' ? handleDelete : handleToggleBan}
        onCancel={() => setModalState({ isOpen: false, type: null, targetId: null })}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-500" />
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้ใช้..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-ink-700 bg-ink-800 py-2 pl-9 pr-4 text-sm text-paper-100 placeholder-paper-500 focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-ink-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-800 text-paper-400">
            <tr>
              <th className="px-4 py-3 font-medium">ชื่อผู้ใช้</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium">วันที่สมัคร</th>
              <th className="px-4 py-3 text-right font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700 bg-ink-900 text-paper-300">
            {filteredUsers.map((user) => (
              <tr key={user.id} className={`hover:bg-ink-800/50 ${user.is_banned ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-paper-200">{user.username}</td>
                <td className="px-4 py-3">
                  {user.is_banned ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-danger-500/10 px-2 py-1 text-xs text-danger-400">
                      <Ban className="h-3 w-3" />
                      ถูกระงับ
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-400">
                      <CheckCircle className="h-3 w-3" />
                      ปกติ
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant={user.is_banned ? 'secondary' : 'secondary'}
                      size="sm"
                      onClick={() => setModalState({ isOpen: true, type: 'ban', targetId: user.id, isBanned: user.is_banned })}
                      disabled={loading}
                      className={user.is_banned ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'}
                    >
                      {user.is_banned ? 'ปลดแบน' : 'แบน'}
                    </Button>
                    {(adminRole === 'superadmin' || adminRole === 'developer') && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setModalState({ isOpen: true, type: 'delete', targetId: user.id })}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-paper-500">
                  ไม่พบผู้ใช้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
