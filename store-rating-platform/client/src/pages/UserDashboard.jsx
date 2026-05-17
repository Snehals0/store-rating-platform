import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stores, setStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/stores', { params: { search: searchQuery } });
      setStores(res.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce the search input slightly to avoid spamming the backend
    const timeoutId = setTimeout(() => {
      fetchStores();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleRateStore = async (storeId, newRatingValue) => {
    try {
      await api.post('/users/ratings', { storeId, rating: newRatingValue });
      
      // Optimistically update the UI to feel instant
      setStores(prevStores => prevStores.map(store => {
        if (store.id === storeId) {
          // If the user already had a rating, we adjust the average math simply or just refetch
          // To be perfectly accurate with the global average, refetching is safer.
          // But for instant feedback on THEIR rating, we update their personal rating immediately.
          return { ...store, myRating: newRatingValue };
        }
        return store;
      }));

      // Silently refresh the full data in the background to ensure averageRating is mathematically correct
      const res = await api.get('/users/stores', { params: { search: searchQuery } });
      setStores(res.data);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  // Star Rating Sub-component
  const StarRating = ({ currentRating, onRate }) => {
    const [hoverRating, setHoverRating] = useState(0);
    
    return (
      <div className="flex space-x-1" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-125"
            onMouseEnter={() => setHoverRating(star)}
            onClick={() => onRate(star)}
          >
            <svg
              className={`w-6 h-6 ${(hoverRating || currentRating) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
            <p className="text-sm text-gray-500">Discover and rate local stores</p>
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
        <div className="mb-6">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search stores by Name or Address..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(skeleton => (
              <div key={skeleton} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded w-1/2 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
            <p className="mt-1 text-sm text-gray-500">We couldn't find any stores matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map(store => (
              <div key={store.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-2 pr-2">{store.name}</h2>
                  <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 flex-shrink-0">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="font-bold text-gray-800">{store.averageRating || '0.0'}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-6 flex-grow line-clamp-3">
                  <span className="block font-medium text-gray-400 text-xs uppercase mb-1">Location</span>
                  {store.address}
                </p>

                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                    {store.myRating ? 'Your Rating' : 'Rate this store'}
                  </p>
                  <StarRating 
                    currentRating={store.myRating || 0} 
                    onRate={(val) => handleRateStore(store.id, val)} 
                  />
                  {store.myRating && (
                    <p className="text-xs text-green-600 mt-2 font-medium">✓ Rating submitted</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default UserDashboard;
