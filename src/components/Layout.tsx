import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, User, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <Briefcase className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">BusinessShowcase</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/businesses" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                  Businesses
                </Link>
                {user && (
                  <Link to="/dashboard" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <>
                  <Link to="/dashboard" className="p-2 text-gray-600 hover:text-gray-900">
                    <User className="h-6 w-6" />
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-gray-900">
                    <LogOut className="h-6 w-6" />
                  </button>
                </>
              ) : (
                <Link 
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}