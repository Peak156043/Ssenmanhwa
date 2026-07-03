'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Shield, ShieldCheck, Trash2, Plus, Ban, CheckCircle, Code } from 'lucide-react';
import { addAdminAction, removeAdminAction, changeAdminRoleAction } from '@/lib/actions/superadmin';
import { toggleBanUserAction } from '@/lib/actions/admin-users';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'superadmin' | 'developer';
  last_login_at: string | null;
  is_banned: boolean;
}

interface AvailableUser {
  id: string;
  username: string;
}

const getRoleWeight = (role: string) => {
  if (role === 'developer') return 3;
  if (role === 'superadmin') return 2;
  if (role === 'admin' || role === 'editor') return 1;
  return 0;
};

export function AdminsTable({ 
  admins, 
  availableUsers,
  currentUserId,
  currentUserRole
}: { 
  admins: AdminUser[]; 
  availableUsers: AvailableUser[];
  currentUserId: string;
  currentUserRole: string;
}) {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'superadmin' | 'developer'>('admin');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'ban' | 'remove' | null;
    targetId: string | null;
    isBanned?: boolean;
  }>({ isOpen: false, type: null, targetId: null });

  const filteredUsers = availableUsers.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAdmin = async () => {
    if (!selectedUser) return;
    setLoading(true);
    await addAdminAction(selectedUser, selectedRole);
    setLoading(false);
    setSelectedUser('');
    setSearchQuery('');
  };

  const handleRemove = async () => {
    if (!modalState.targetId) return;
    setLoading(true);
    await removeAdminAction(modalState.targetId);
    setLoading(false);
    setModalState({ isOpen: false, type: null, targetId: null });
  };

  const handleToggleBan = async () => {
    if (!modalState.targetId) return;
    setLoading(true);
    await toggleBanUserAction(modalState.targetId, modalState.isBanned || false);
    setLoading(false);
    setModalState({ isOpen: false, type: null, targetId: null });
  };

  const handleChangeRole = async (id: string, currentRole: 'admin' | 'superadmin' | 'developer') => {
    // Only superadmin or developer can change roles, and logic handles what they can change to.
    let newRole: 'admin' | 'superadmin' | 'developer' = 'superadmin';
    if (currentRole === 'superadmin') newRole = 'admin';
    if (currentRole === 'developer') newRole = 'superadmin';

    if (!confirm(`ยืนยันการเปลี่ยนสิทธิ์เป็น ${newRole}?`)) return;
    setLoading(true);
    await changeAdminRoleAction(id, newRole);
    setLoading(false);
  };

  const actorWeight = getRoleWeight(currentUserRole);

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.type === 'remove' ? 'ยืนยันการถอดสิทธิ์' : (modalState.isBanned ? 'ยืนยันการปลดแบน' : 'ยืนยันการแบน')}
        description={modalState.type === 'remove' 
          ? 'การกระทำนี้จะลบผู้ใช้คนนี้ออกจากระบบหลังบ้าน แต่ยังคงสามารถใช้งานเว็บไซต์ในฐานะผู้ใช้ทั่วไปได้' 
          : (modalState.isBanned ? 'ผู้ใช้นี้จะสามารถกลับมาล็อกอินเข้าสู่ระบบได้ตามปกติ' : 'ผู้ใช้นี้จะไม่สามารถล็อกอินเข้าสู่ระบบเว็บไซต์ได้อีก')}
        confirmText={modalState.type === 'remove' ? 'ถอดสิทธิ์' : (modalState.isBanned ? 'ปลดแบน' : 'แบน')}
        isLoading={loading}
        onConfirm={modalState.type === 'remove' ? handleRemove : handleToggleBan}
        onCancel={() => setModalState({ isOpen: false, type: null, targetId: null })}
      />

      {/* Add Admin Form */}
      <div className="rounded-lg border border-ink-700 bg-ink-800 p-4">
        <h2 className="mb-4 text-sm font-medium text-paper-200">เพิ่มผู้ดูแลระบบใหม่</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative flex-1">
            <label className="mb-1 block text-xs text-paper-400">ค้นหาและเลือกผู้ใช้</label>
            <input
              type="text"
              placeholder="พิมพ์ชื่อเพื่อค้นหา..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedUser('');
              }}
              className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-paper-200 focus:border-violet-500 focus:outline-none"
            />
            {searchQuery && !selectedUser && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-ink-700 bg-ink-800 shadow-lg">
                {filteredUsers.length > 0 ? (
                  <ul className="py-1 text-sm text-paper-200">
                    {filteredUsers.map((u) => (
                      <li
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u.id);
                          setSearchQuery(u.username);
                        }}
                        className="cursor-pointer px-3 py-2 hover:bg-violet-500/20 hover:text-violet-300"
                      >
                        {u.username}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-2 text-sm text-paper-400">ไม่พบผู้ใช้</div>
                )}
              </div>
            )}
          </div>
          
          <div className="w-full sm:w-48">
            <label className="mb-1 block text-xs text-paper-400">สิทธิ์</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'superadmin' | 'developer')}
              className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-paper-200 focus:border-violet-500 focus:outline-none"
            >
              <option value="admin">Admin (Editor)</option>
              <option value="superadmin">Super Admin</option>
              {currentUserRole === 'developer' && <option value="developer">Developer</option>}
            </select>
          </div>
          
          <Button onClick={handleAddAdmin} disabled={!selectedUser || loading} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> เพิ่ม
          </Button>
        </div>
      </div>

      {/* Admins Table */}
      <div className="overflow-x-auto rounded-lg border border-ink-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-800 text-paper-400">
            <tr>
              <th className="px-4 py-3 font-medium">ชื่อผู้ดูแล</th>
              <th className="px-4 py-3 font-medium">สิทธิ์</th>
              <th className="px-4 py-3 font-medium">ล็อกอินล่าสุด</th>
              <th className="px-4 py-3 text-right font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700 bg-ink-900 text-paper-300">
            {admins.map((admin) => {
              const targetWeight = getRoleWeight(admin.role);
              const canManage = currentUserRole === 'developer' ? actorWeight >= targetWeight : actorWeight > targetWeight;
              const isSelf = admin.id === currentUserId;

              return (
                <tr key={admin.id} className={`hover:bg-ink-800/50 ${admin.is_banned ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-paper-200">
                      {admin.username} {isSelf && '(คุณ)'}
                      {admin.is_banned && <span className="ml-2 text-xs text-danger-400 font-normal">(ถูกแบน)</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {admin.role === 'developer' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-fuchsia-500/10 px-2 py-1 text-xs text-fuchsia-400">
                        <Code className="h-3 w-3" />
                        Developer
                      </span>
                    ) : admin.role === 'superadmin' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-1 text-xs text-violet-400">
                        <ShieldCheck className="h-3 w-3" />
                        Super Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {admin.last_login_at ? new Date(admin.last_login_at).toLocaleString('th-TH') : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {!isSelf && canManage && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setModalState({ isOpen: true, type: 'ban', targetId: admin.id, isBanned: admin.is_banned })}
                            disabled={loading}
                            className={admin.is_banned ? 'text-green-400 hover:bg-green-500/10' : 'text-amber-400 hover:bg-amber-500/10'}
                          >
                            {admin.is_banned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setModalState({ isOpen: true, type: 'remove', targetId: admin.id })}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
