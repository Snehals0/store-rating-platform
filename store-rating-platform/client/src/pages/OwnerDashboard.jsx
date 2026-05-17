import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

const OwnerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/stores/dashboard');
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to fetch owner metrics:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
          </div>
          <div className="flex space-x-4 items-center">
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Change Password
            </button>
            <div className="h-4 border-l border-gray-300"></div>
            <button 
              onClick={logout} 
              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl w-full"></div>
            <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Dashboard</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            {error.includes('No store found') && (
              <p className="mt-4 text-xs text-blue-600 bg-blue-50 py-2 px-4 rounded-lg inline-block">
                Please contact the System Administrator to link a store to your account.
              </p>
            )}
          </div>
        ) : metrics ? (
          <>
            {/* Top Metrics Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-3xl font-extrabold mb-1">{metrics.storeName}</h2>
                  <p className="text-blue-100 max-w-lg opacity-90 text-sm">{metrics.address}</p>
                </div>
                <div className="mt-6 md:mt-0 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-4 text-center min-w-[150px]">
                  <p className="text-sm font-medium text-blue-100 uppercase tracking-wider mb-1">Overall Rating</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-yellow-300 text-3xl">★</span>
                    <span className="text-4xl font-black">{metrics.averageRating}</span>
                  </div>
                </div>
              </div>
              {/* Decorative background circle */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5 blur-2xl"></div>
            </div>

            {/* Ratings Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Customer Ratings Activity</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {metrics.ratingsList.length} Total Review{metrics.ratingsList.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {metrics.ratingsList.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900">No ratings yet</h3>
                  <p className="mt-1 text-sm text-gray-500 max-w-sm">Your store hasn't received any ratings from customers. Once users rate your store, their scores will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Customer Name</th>
                        <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Email Address</th>
                        <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Submitted Rating</th>
                        <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {metrics.ratingsList.map((rating) => (
                        <tr key={rating.ratingId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {rating.userName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {rating.userEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star} 
                                  className={`w-4 h-4 ${rating.ratingValue >= star ? 'text-yellow-400' : 'text-gray-200'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-2 font-medium text-gray-700">{rating.ratingValue}/5</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                            {new Date(rating.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default OwnerDashboard;
