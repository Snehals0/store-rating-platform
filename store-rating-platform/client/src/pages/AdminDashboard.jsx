import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Dashboard Metrics
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  
  // Tabs: 'users' | 'stores'
  const [activeTab, setActiveTab] = useState('users');
  
  // Data States
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting States for Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('createdAt');
  const [userSortOrder, setUserSortOrder] = useState('DESC');

  // Filters & Sorting States for Stores
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('createdAt');
  const [storeSortOrder, setStoreSortOrder] = useState('DESC');

  // Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);

  // Form States
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'USER' });
  const [newStore, setNewStore] = useState({ name: '', address: '', ownerId: '' });
  const [formError, setFormError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: userSearch,
        role: userRoleFilter,
        sortBy: userSortBy,
        order: userSortOrder
      };
      const res = await api.get('/admin/users', { params });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: storeSearch,
        sortBy: storeSortBy,
        order: storeSortOrder
      };
      const res = await api.get('/admin/stores', { params });
      setStores(res.data);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, userSearch, userRoleFilter, userSortBy, userSortOrder]);

  useEffect(() => {
    if (activeTab === 'stores') fetchStores();
  }, [activeTab, storeSearch, storeSortBy, storeSortOrder]);

  // Handlers for Column Header Clicks
  const handleUserSort = (column) => {
    if (userSortBy === column) {
      setUserSortOrder(userSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setUserSortBy(column);
      setUserSortOrder('ASC');
    }
  };

  const handleStoreSort = (column) => {
    if (storeSortBy === column) {
      setStoreSortOrder(storeSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setStoreSortBy(column);
      setUserSortOrder('ASC');
    }
  };

  // Handlers for Form Submissions
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/admin/users', newUser);
      setShowUserModal(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'USER' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/admin/stores', newStore);
      setShowStoreModal(false);
      setNewStore({ name: '', address: '', ownerId: '' });
      fetchStores();
      fetchStats();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create store');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Users</h3>
            <p className="text-4xl font-extrabold text-blue-600 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Stores</h3>
            <p className="text-4xl font-extrabold text-emerald-600 mt-2">{stats.totalStores}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Ratings</h3>
            <p className="text-4xl font-extrabold text-indigo-600 mt-2">{stats.totalRatings}</p>
          </div>
        </div>

        {/* Action Bar & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === 'users' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Users Directory
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === 'stores' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Stores Directory
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowUserModal(true)}
              className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors"
            >
              + Add User
            </button>
            <button 
              onClick={() => setShowStoreModal(true)}
              className="bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors"
            >
              + Add Store
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div>
              {/* Filters */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Search Name, Email, Address..." 
                  className="px-4 py-2 border rounded-lg flex-grow outline-none focus:ring-2 focus:ring-blue-500"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <select 
                  className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[150px]"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                  <option value="OWNER">Store Owner</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th onClick={() => handleUserSort('name')} className="px-6 py-3 font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                        Name {userSortBy === 'name' && (userSortOrder === 'ASC' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleUserSort('email')} className="px-6 py-3 font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                        Email {userSortBy === 'email' && (userSortOrder === 'ASC' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleUserSort('role')} className="px-6 py-3 font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                        Role {userSortBy === 'role' && (userSortOrder === 'ASC' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 font-medium text-gray-500">
                        Address
                      </th>
                      <th className="px-6 py-3 font-medium text-gray-500">
                        Store Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">Loading users...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No users found.</td></tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                              user.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{user.address || '-'}</td>
                          <td className="px-6 py-4">
                            {user.role === 'OWNER' && user.stores && user.stores.length > 0 ? (
                              <div className="flex flex-col space-y-1">
                                {user.stores.map(store => (
                                  <div key={store.id} className="flex items-center space-x-1">
                                    <span className="text-yellow-500">★</span>
                                    <span className="font-medium">{store.averageRating || '0.0'}</span>
                                    <span className="text-xs text-gray-400">({store.name})</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STORES TAB */}
          {activeTab === 'stores' && (
            <div>
              {/* Filters */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <input 
                  type="text" 
                  placeholder="Search Stores by Name or Address..." 
                  className="w-full md:w-1/2 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                />
              </div>

              {/* Stores Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th onClick={() => handleStoreSort('name')} className="px-6 py-3 font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                        Store Name {storeSortBy === 'name' && (storeSortOrder === 'ASC' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleStoreSort('address')} className="px-6 py-3 font-medium text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                        Address {storeSortBy === 'address' && (storeSortOrder === 'ASC' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 font-medium text-gray-500">
                        Owner
                      </th>
                      <th className="px-6 py-3 font-medium text-gray-500">
                        Overall Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoading ? (
                      <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">Loading stores...</td></tr>
                    ) : stores.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No stores found.</td></tr>
                    ) : (
                      stores.map(store => (
                        <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{store.name}</td>
                          <td className="px-6 py-4 text-gray-500 max-w-md truncate">{store.address}</td>
                          <td className="px-6 py-4 text-gray-600">{store.owner?.name || 'Unknown'}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500 text-lg">★</span>
                              <span className="font-bold text-gray-900">{store.averageRating || '0.0'}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE USER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Add New User</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {formError && <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">{formError}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (Min 20 chars)</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-md" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input required type="email" className="w-full px-3 py-2 border rounded-md" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input required type="password" placeholder="8-16 chars, 1 Uppercase, 1 Special" className="w-full px-3 py-2 border rounded-md" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" className="w-full px-3 py-2 border rounded-md" value={newUser.address} onChange={e => setNewUser({...newUser, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border rounded-md bg-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="USER">Normal User</option>
                  <option value="OWNER">Store Owner</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE STORE MODAL */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">Add New Store</h3>
              <button onClick={() => setShowStoreModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateStore} className="p-6 space-y-4">
              {formError && <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">{formError}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name (Min 20 chars)</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-md" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address (Max 400 chars)</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-md" value={newStore.address} onChange={e => setNewStore({...newStore, address: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner User ID (UUID)</label>
                <input required type="text" placeholder="UUID of an existing OWNER" className="w-full px-3 py-2 border rounded-md" value={newStore.ownerId} onChange={e => setNewStore({...newStore, ownerId: e.target.value})} />
                <p className="text-xs text-gray-500 mt-1">You must paste the ID of a user with the OWNER role.</p>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowStoreModal(false)} className="flex-1 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Create Store</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />
    </div>
  );
};

export default AdminDashboard;
