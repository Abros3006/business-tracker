import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, Building2, Settings } from 'lucide-react';
import { Profile, Business } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'businesses' | 'users'>('overview');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profile);

      if (profile.role === 'admin') {
        // Load all users for admin
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) throw usersError;
        setUsers(usersData || []);
      }

      // Load businesses based on role
      let query = supabase
        .from('businesses')
        .select('*, profiles!businesses_owner_id_fkey(full_name)')
        .order('created_at', { ascending: false });

      // If student, only load their business
      if (profile.role === 'student') {
        query = query.eq('owner_id', user.id);
      }

      const { data: businessesData, error: businessError } = await query;

      if (businessError) throw businessError;
      setBusinesses(businessesData || []);
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    try {
      // First delete the user's businesses
      const { error: businessError } = await supabase
        .from('businesses')
        .delete()
        .eq('owner_id', userId);

      if (businessError) throw businessError;

      // Then delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Finally delete the user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      toast.success('User deleted successfully');
      loadProfile(); // Reload data
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {profile.full_name}
        </h1>
        <p className="mt-1 text-gray-600">
          {profile.role === 'admin' ? 'Administrator Dashboard' : 'Business Owner Dashboard'}
        </p>
      </div>

      {profile.role === 'admin' && (
        <div className="mb-8">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'overview'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'users'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              User Management
            </button>
          </nav>
        </div>
      )}

      {/* Dashboard Stats */}
      {(activeTab === 'overview' || profile.role === 'student') && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-indigo-600" />
              <span className="ml-3 text-xl font-semibold">{businesses.length}</span>
            </div>
            <p className="mt-2 text-gray-600">Total Businesses</p>
          </div>

          {profile.role === 'admin' && (
            <>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <span className="ml-3 text-xl font-semibold">{users.length}</span>
                </div>
                <p className="mt-2 text-gray-600">Active Users</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <span className="ml-3 text-xl font-semibold">
                    {businesses.length}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">Total Businesses</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-purple-600" />
                  <span className="ml-3 text-xl font-semibold">
                    {businesses.filter(b => b.featured).length}
                  </span>
                </div>
                <p className="mt-2 text-gray-600">Featured Businesses</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Admin Specific Views */}
      {profile.role === 'admin' && activeTab === 'users' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.id !== profile.id && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                            handleDeleteUser(user.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Business Listings for Students */}
      {profile.role === 'student' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Your Business</h2>
            {businesses.length === 0 && (
              <Link
                to="/business/manage"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Business
              </Link>
            )}
          </div>
          <div className="divide-y divide-gray-200">
            {businesses.map((business) => (
              <div key={business.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{business.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{business.industry}</p>
                  </div>
                  <Link
                    to="/business/manage"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Manage Business
                  </Link>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{business.description}</p>
              </div>
            ))}
            {businesses.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                You haven't created a business yet. Click 'Create Business' to get started!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}