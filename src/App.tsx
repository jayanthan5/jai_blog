import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { BlogList } from './components/public/BlogList';
import { BlogDetail } from './components/public/BlogDetail';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminSidebar, AdminTab } from './components/admin/AdminSidebar';
import { DashboardView } from './components/admin/DashboardView';
import { CreateBlogView } from './components/admin/CreateBlogView';
import { ManageBlogsView } from './components/admin/ManageBlogsView';
import { ProfileView } from './components/admin/ProfileView';
import { SpringBootExplorer } from './components/admin/SpringBootExplorer';

function MainAppContent() {
  const { isAuthenticated } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<'public' | 'admin' | 'springboot-code'>('public');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  
  // Public Reader sub-routing
  const [publicDetailId, setPublicDetailId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Admin Create/Edit Blog routing
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);

  // URL-based routing logic (Admin portal accessible only via URL)
  const isUrlAdmin = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    return (
      hash.includes('admin') ||
      path.startsWith('/admin') ||
      search.includes('admin') ||
      search.includes('view=admin')
    );
  }, []);

  const isUrlSpringBoot = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    return (
      hash.includes('springboot') ||
      hash.includes('spring-boot') ||
      path.startsWith('/springboot') ||
      search.includes('view=springboot')
    );
  }, []);

  // Sync state with URL changes (on mount, popstate, hashchange)
  useEffect(() => {
    const handleUrlSync = () => {
      if (isUrlAdmin()) {
        setCurrentView('admin');
      } else if (isUrlSpringBoot()) {
        setCurrentView('springboot-code');
      } else {
        setCurrentView('public');
      }
    };

    // Run on initial load
    handleUrlSync();

    // Listen for browser navigation / manual URL changes
    window.addEventListener('hashchange', handleUrlSync);
    window.addEventListener('popstate', handleUrlSync);

    return () => {
      window.removeEventListener('hashchange', handleUrlSync);
      window.removeEventListener('popstate', handleUrlSync);
    };
  }, [isUrlAdmin, isUrlSpringBoot]);

  // Programmatic view switcher that also updates the URL
  const handleNavigate = (view: 'public' | 'admin' | 'springboot-code') => {
    setCurrentView(view);
    if (view === 'admin') {
      setAdminTab('dashboard');
      if (!isUrlAdmin()) {
        window.history.pushState(null, '', '#admin');
      }
    } else if (view === 'springboot-code') {
      if (!isUrlSpringBoot()) {
        window.history.pushState(null, '', '#springboot-code');
      }
    } else {
      // Exit to public: clean hash / path
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/springboot')) {
        window.history.pushState(null, '', '/');
      } else if (window.location.hash.includes('admin') || window.location.hash.includes('springboot')) {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    }
  };

  // Handlers
  const handleSelectBlog = (blogId: string) => {
    setPublicDetailId(blogId);
  };

  const handleBackToList = () => {
    setPublicDetailId(null);
  };

  const handleEditBlogInAdmin = (blogId: string) => {
    setEditingBlogId(blogId);
    setAdminTab('create-blog');
  };

  const handleCreateNewInAdmin = () => {
    setEditingBlogId(null);
    setAdminTab('create-blog');
  };

  const handleFinishEditing = () => {
    setEditingBlogId(null);
    setAdminTab('manage-blog');
  };

  const handleViewPublicBlogFromAdmin = (blogId: string) => {
    setPublicDetailId(blogId);
    handleNavigate('public');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-[#0f172a] font-sans antialiased">
      {/* Persistent Global Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* View 1: Spring Boot (Maven) Code & REST API Console */}
      {currentView === 'springboot-code' && (
        <main className="flex-1 overflow-y-auto">
          <SpringBootExplorer />
        </main>
      )}

      {/* View 2: Public Reader */}
      {currentView === 'public' && (
        <main className="flex-1">
          {publicDetailId ? (
            <BlogDetail blogId={publicDetailId} onBack={handleBackToList} />
          ) : (
            <BlogList
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSelectBlog={handleSelectBlog}
            />
          )}
        </main>
      )}

      {/* View 3: Admin Portal */}
      {currentView === 'admin' && (
        <>
          {!isAuthenticated ? (
            /* Admin Login & 2FA OTP Modal Flow (AUTH-01 to AUTH-04) */
            <AdminLogin
              onLoginSuccess={() => setAdminTab('dashboard')}
              onCancel={() => handleNavigate('public')}
            />
          ) : (
            /* Admin Console Layout with 10% / 64-width Sidebar (Spec Section 3 & 4) */
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <AdminSidebar
                activeTab={adminTab}
                onSelectTab={(tab) => {
                  setAdminTab(tab);
                  if (tab === 'create-blog') {
                    setEditingBlogId(null);
                  }
                }}
                onExitAdmin={() => handleNavigate('public')}
              />

              {/* Admin Main Dynamic Canvas Area */}
              <div className="flex-1 overflow-y-auto bg-slate-100">
                {adminTab === 'dashboard' && (
                  <DashboardView
                    onNavigateToCreate={handleCreateNewInAdmin}
                    onNavigateToManage={() => setAdminTab('manage-blog')}
                    onEditBlog={handleEditBlogInAdmin}
                    onViewPublicBlog={handleViewPublicBlogFromAdmin}
                    onViewSpringBoot={() => handleNavigate('springboot-code')}
                  />
                )}

                {adminTab === 'create-blog' && (
                  <CreateBlogView
                    editingBlogId={editingBlogId}
                    onFinish={handleFinishEditing}
                    onCancel={() => setAdminTab('manage-blog')}
                  />
                )}

                {adminTab === 'manage-blog' && (
                  <ManageBlogsView
                    onEditBlog={handleEditBlogInAdmin}
                    onCreateNew={handleCreateNewInAdmin}
                    onViewPublic={handleViewPublicBlogFromAdmin}
                  />
                )}

                {adminTab === 'profile' && <ProfileView />}

                {adminTab === 'springboot-code' && <SpringBootExplorer />}
              </div>
            </div>
          )}
        </>
      )}

      {/* Global Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong className="text-slate-800">Jai-Blog</strong> — Visual Drag-and-Drop Blog Platform &amp; Java Spring Boot (Maven) Backend.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => handleNavigate('springboot-code')}
              className="text-[#3368a0] hover:underline font-semibold"
            >
              Spring Boot Codebase
            </button>
            <span>•</span>
            <span>MySQL (Relational) + MongoDB (NoSQL)</span>
            <span>•</span>
            <span>2FA OTP Email Verification</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
