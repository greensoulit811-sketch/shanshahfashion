import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function ProtectedAdminRoute() {
  const { user, isAdmin, isLoading, authError } = useAuth();
  const location = useLocation();

  // Show loading state only while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if auth failed but allow navigation to login
  if (authError && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-muted-foreground mb-6">{authError}</p>
          <a
            href="/admin/login"
            className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium inline-block"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login (but avoid loop on login page)
  if (!user) {
    // Already on login page? Let them stay
    if (location.pathname === '/admin/login') {
      return <Outlet />;
    }
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  // Logged in but not admin - show access denied (no redirect loop)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges to access this area. 
            Please contact an administrator to grant you access.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/"
              className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium inline-block"
            >
              Back to Store
            </a>
            <button
              onClick={() => {
                import('@/integrations/supabase/client').then(({ supabase }) => {
                  supabase.auth.signOut().then(() => {
                    window.location.href = '/admin/login';
                  });
                });
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign out and try different account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is admin - render admin routes
  return <Outlet />;
}
