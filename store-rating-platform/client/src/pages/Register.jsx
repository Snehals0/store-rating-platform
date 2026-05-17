import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'name':
        if (value.length > 0 && value.length < 20) {
          errorMsg = 'Name must be at least 20 characters long.';
        } else if (value.length > 60) {
          errorMsg = 'Name cannot exceed 60 characters.';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value.length > 0 && !emailRegex.test(value)) {
          errorMsg = 'Please enter a valid email address.';
        }
        break;
      case 'password':
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
        if (value.length > 0 && !passwordRegex.test(value)) {
          errorMsg = 'Password must be 8-16 characters, containing at least one uppercase letter and one special character.';
        }
        break;
      case 'address':
        if (value.length > 400) {
          errorMsg = 'Address cannot exceed 400 characters.';
        }
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const isFormValid = () => {
    // Check if any errors exist
    if (Object.values(errors).some(err => err !== '')) return false;
    
    // Check required fields
    if (formData.name.length < 20 || formData.name.length > 60) return false;
    if (!formData.email) return false;
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
    if (!passwordRegex.test(formData.password)) return false;
    
    if (formData.address && formData.address.length > 400) return false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!isFormValid()) {
      setServerError('Please fix the validation errors before submitting.');
      return;
    }

    setIsLoading(true);
    
    try {
      // API call to register (defaults to USER role backend-side)
      await api.post('/auth/register', formData);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] py-10">
      <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create an Account</h2>
          <p className="text-sm text-gray-500 mt-2">Join to start rating your favorite stores.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
              {serverError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Full Name <span className="text-xs text-gray-400 font-normal">(Min 20 characters)</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="e.g. Johnathan Bartholomew Doe"
              required
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Enter your email"
              required
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="••••••••"
              required
            />
            {errors.password && <p className="mt-1 text-xs text-red-600 leading-tight">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
              Address <span className="text-xs text-gray-400 font-normal">(Optional, max 400 chars)</span>
            </label>
            <textarea
              id="address"
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all resize-none ${
                errors.address ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Enter your address"
            />
            {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
            <p className="text-right text-xs text-gray-400 mt-1">{formData.address.length}/400</p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className={`w-full py-3 px-4 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              isLoading || !isFormValid() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
