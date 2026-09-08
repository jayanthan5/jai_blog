import React from 'react';
import { 
  LayoutDashboard, 
  PenTool, 
  Layers, 
  UserCog, 
  LogOut, 
  Code2, 
  BookOpen, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AdminTab = 'dashboard' | 'create-blog' | 'manage-blog' | 'profile' | 'springboot-code';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onExitAdmin,
}) => {
  const { logout, user } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics',
    },
    {
      id: 'create-blog' as AdminTab,
      label: 'Create Blog',
      icon: PenTool,
      description: 'Metadata + Visual builder',
    },
    {
      id: 'manage-blog' as AdminTab,
      label: 'Manage Blogs',
      icon: Layers,
      description: 'Edit, publish & delete',
    },
    {
      id: 'profile' as AdminTab,
      label: 'Profile & Security',
      icon: UserCog,
      description: 'Admin 2FA & Password',
    },
    {
      id: 'springboot-code' as AdminTab,
      label: 'Spring Boot (Maven)',
      icon: Code2,
      description: 'Java Code & REST API',
      badge: 'Maven',
    },
  ];

  return (
    <aside
      className="w-64 md:w-60 lg:w-64 shrink-0 flex flex-col justify-between border-r border-slate-300 min-h-[calc(100vh-4rem)] p-3 select-none transition-all shadow-xs"
      style={{ backgroundColor: 'rgb(200, 223, 219)' }} // UI/UX Spec Color: rgb(200, 223, 219)
    >
      <div className="space-y-4">
        {/* Admin Branding Header */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0f172a]">
            <ShieldCheck className="w-4 h-4 text-[#3368a0]" />
            <span>Admin Control</span>
          </div>
          <p className="text-[11px] text-[#475569] mt-0.5 font-medium">
            Jai-Blog Console
          </p>
        </div>

        {/* Navigation Items (UI/UX Spec Section 4) */}
        <nav className="space-y-1.5" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all group ${
                  isActive
                    ? 'bg-[#3368a0] text-white shadow-sm'
                    : 'text-[#0f172a] hover:bg-slate-300/60 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#3368a0] group-hover:scale-110 transition-transform'
                    }`}
                  />
                  <div>
                    <div className="leading-none">{item.label}</div>
                    <div
                      className={`text-[10px] mt-1 ${
                        isActive ? 'text-sky-100' : 'text-[#475569]'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile and Utilities */}
      <div className="pt-4 border-t border-slate-300/80 space-y-2">
        {/* Quick Switch to Public Reader */}
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#0f172a] hover:bg-slate-300/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#3368a0]" />
            <span>Public Reader</span>
          </span>
          <span className="text-[10px] text-slate-500">Exit</span>
        </button>

        {/* Current Admin Session User */}
        <div className="px-3 py-2 bg-white/60 rounded-xl border border-slate-300/60 flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <p className="text-xs font-bold text-[#0f172a] truncate">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-[#475569] truncate">
              {user?.email || 'admin@jaiblog.com'}
            </p>
          </div>
          <button
            onClick={logout}
            title="Logout and destroy session (AUTH-06)"
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
