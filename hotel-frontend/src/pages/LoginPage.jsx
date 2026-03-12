import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { 
  FaHotel, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaShieldAlt,
  FaCashRegister,
  FaConciergeBell,
  FaArrowLeft,
  FaSignInAlt,
  FaUserPlus,
  FaBuilding,
  FaKey,
  FaCheckCircle
} from 'react-icons/fa';
import { login, register } from '../https';
import { setUser } from '../redux/slices/userSlice';
import hotel from '../assets/images/solitair.png';

const LoginPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: ""
  });
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuth } = useSelector((state) => state.user);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuth) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuth, navigate, location]);

  // Check password strength
  useEffect(() => {
    if (!isLoginMode && formData.password) {
      let strength = 0;
      if (formData.password.length >= 6) strength++;
      if (/[A-Z]/.test(formData.password)) strength++;
      if (/[0-9]/.test(formData.password)) strength++;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
      setPasswordStrength(strength);
    }
  }, [formData.password, isLoginMode]);

  // Role options with icons
  const roleOptions = [
    { value: 'Admin', label: 'Admin', icon: <FaShieldAlt />, color: 'bg-gradient-to-r from-red-500 to-red-600' },
    { value: 'Cashier', label: 'Cashier', icon: <FaCashRegister />, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { value: 'Services', label: 'Services', icon: <FaConciergeBell />, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' }
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (isLoginMode) {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  // Handle role selection
  const handleRoleSelection = (selectedRole) => {
    setFormData(prev => ({ ...prev, role: selectedRole }));
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  // Validate registration form
  const validateRegistrationForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate login form
  const validateLoginForm = () => {
    const newErrors = {};
    
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLoginMode) {
      if (!validateLoginForm()) return;
      loginMutation.mutate(loginData);
    } else {
      if (!validateRegistrationForm()) return;
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = formData;
      registerMutation.mutate(registerData);
    }
  };

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (reqData) => register(reqData),
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: (res) => {
      const { data } = res;
      enqueueSnackbar(data.message || 'Registration successful!', { 
        variant: "success",
        autoHideDuration: 3000
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: ""
      });
      
      // Switch to login mode after successful registration
      setTimeout(() => {
        setIsLoginMode(true);
        setLoginData({ email: formData.email, password: '' }); // Pre-fill email
      }, 1500);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      enqueueSnackbar(message, { 
        variant: "error",
        autoHideDuration: 4000
      });
      
      // Set field errors if available
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  // Login mutation
  
    const loginMutation = useMutation({
        mutationFn: (reqData) => login(reqData),
        onSuccess: (res) => {
            const { data } = res;
            const { _id, name, email, phone, role } = data.data;
            dispatch(setUser({ _id, name, email, phone, role }));
            navigate('/');
        },
        onError: (error) => {
            const { response } = error;
            enqueueSnackbar(response.data.message, { variant: "error" });
        }
    });
//   const loginMutation = useMutation({
//     mutationFn: (reqData) => login(reqData),
//     onMutate: () => {
//       setIsSubmitting(true);
//     },
//     onSuccess: (res) => {
//       const { data } = res;
//       const { _id, name, email, phone, role, token } = data.data;
      
//       // Save token if provided
//       if (token) {
//         localStorage.setItem('authToken', token);
//       }
      
//       dispatch(setUser({ _id, name, email, phone, role }));
//       dispatch(setUser(true));
  
      
//       enqueueSnackbar('Login successful!', { 
//         variant: "success",
//         autoHideDuration: 2000
//       });
      
//       // Redirect to the intended page or dashboard
//     //   const from = location.state?.from?.pathname || '/';
//     //   navigate(from, { replace: true });
    
//       // Navigate to home page AFTER state is updated
//     navigate('/');

//     },
//     onError: (error) => {
//       const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
//       enqueueSnackbar(message, { 
//         variant: "error",
//         autoHideDuration: 4000
//       });
//     },
//     onSettled: () => {
//       setIsSubmitting(false);
//     }
//   });

  // Toggle between login and register
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    if (!isLoginMode) {
      // When switching to registration, clear login errors
      setLoginData({ email: '', password: '' });
    }
  };

  // Password strength indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Determine if we're loading
  const isLoading = isSubmitting || loginMutation.isLoading || registerMutation.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex flex-col lg:flex-row items-center justify-center p-4 md:p-6">
      {/* Mobile Header - Only show on small screens */}
      <div className="lg:hidden w-full mb-6 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg mb-4">
          <FaHotel className="text-white text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          <span className="text-emerald-600">Solitair</span>Hotel
        </h1>
        <p className="text-gray-600 text-sm">
          {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
        </p>
      </div>

      {/* Left side - Image/Brand Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 max-w-2xl flex-col items-center justify-center p-8 xl:p-12">
        <div className="text-center mb-8 lg:mb-12">
          {/* <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl mb-6">
            <FaHotel className="text-white text-5xl" />
          </div> */}
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-emerald-600">Solitaire</span>Hotel
          </h1>
          <p className="text-lg text-gray-600 max-w-lg">
            {isLoginMode 
              ? 'Sign in to manage your hotel operations efficiently.' 
              : 'Create an account to start managing your hotel operations.'}
          </p>
        </div>
        
        <div className="relative w-full max-w-md bg-emerald-50">
          <img 
            src={hotel}
            alt="Luxury Hotel" 
            className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <h3 className="text-xl font-bold">Premium Hotel Management</h3>
            <p className="text-sm opacity-90">Streamline your operations</p>
          </div>
        </div>
      </div>

      {/* Right side - Form Section */}
      <div className="w-full lg:w-1/2 max-w-md">
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-lg lg:shadow-2xl p-5 sm:p-6 lg:p-8 transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                {isLoginMode ? (
                  <>
                    {/* <FaSignInAlt className="text-emerald-600" /> */}
                    Welcome 
                  </>
                ) : (
                  <>
                    <FaUserPlus className="text-emerald-600" />
                    Create Account
                  </>
                )}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {isLoginMode 
                  ? 'Enter your credentials to access your dashboard'
                  : 'Fill in your details to create a new account'}
              </p>
            </div>
            
            {!isLoginMode && (
              <button
                onClick={() => setIsLoginMode(true)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to login"
              >
                <FaArrowLeft className="text-gray-500 text-sm sm:text-base" />
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Registration Fields */}
            {!isLoginMode && (
              <>
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaUser className="text-emerald-600 text-sm" />
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                        errors.name 
                          ? 'border-red-500 focus:ring-red-200 bg-red-50' 
                          : 'border-gray-300 focus:ring-emerald-200 hover:border-emerald-400'
                      }`}
                      disabled={isLoading}
                    />
                    <FaUser className="absolute left-3 top-2.5 sm:top-3 text-gray-400 text-sm" />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.name}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaPhone className="text-emerald-600 text-sm" />
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+249 *********"
                      className={`w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                        errors.phone 
                          ? 'border-red-500 focus:ring-red-200 bg-red-50' 
                          : 'border-gray-300 focus:ring-emerald-200 hover:border-emerald-400'
                      }`}
                      disabled={isLoading}
                    />
                    <FaPhone className="absolute left-3 top-2.5 sm:top-3 text-gray-400 text-sm" />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.phone}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {roleOptions.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleRoleSelection(role.value)}
                        className={`p-3 sm:p-4 rounded-lg border transition-all duration-200 flex flex-col items-center gap-1 sm:gap-2 ${
                          formData.role === role.value
                            ? `${role.color} text-white shadow-lg scale-[1.02] border-transparent`
                            : 'border-gray-300 hover:border-emerald-300 hover:shadow-md'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                      >
                        <div className="text-base sm:text-xl">{role.icon}</div>
                        <span className="text-xs sm:text-sm font-medium">{role.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <span>⚠</span> {errors.role}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Email Field (Common) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaEnvelope className="text-emerald-600 text-sm" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={isLoginMode ? loginData.email : formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-300 focus:ring-emerald-200 hover:border-emerald-400'
                  }`}
                  disabled={isLoading}
                />
                <FaEnvelope className="absolute left-3 top-2.5 sm:top-3 text-gray-400 text-sm" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field (Common) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaLock className="text-emerald-600 text-sm" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={isLoginMode ? loginData.password : formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 pr-10 sm:pr-11 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-200 bg-red-50' 
                      : 'border-gray-300 focus:ring-emerald-200 hover:border-emerald-400'
                  }`}
                  disabled={isLoading}
                />
                <FaLock className="absolute left-3 top-2.5 sm:top-3 text-gray-400 text-sm" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? 
                    <FaEyeSlash className="text-sm sm:text-base" /> : 
                    <FaEye className="text-sm sm:text-base" />
                  }
                </button>
              </div>
              
              {/* Password strength indicator (registration only) */}
              {!isLoginMode && formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className="text-xs font-medium">
                      {passwordStrength === 0 && 'Weak'}
                      {passwordStrength === 1 && 'Fair'}
                      {passwordStrength === 2 && 'Good'}
                      {passwordStrength === 3 && 'Strong'}
                      {passwordStrength === 4 && 'Very Strong'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                      style={{ width: `${passwordStrength * 25}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`text-xs flex items-center gap-1 ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                      <FaCheckCircle className="text-xs" /> 6+ characters
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <FaCheckCircle className="text-xs" /> Uppercase
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <FaCheckCircle className="text-xs" /> Number
                    </span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password (Registration only) */}
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-11 pr-10 sm:pr-11 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
                      errors.confirmPassword 
                        ? 'border-red-500 focus:ring-red-200 bg-red-50' 
                        : 'border-gray-300 focus:ring-emerald-200 hover:border-emerald-400'
                    }`}
                    disabled={isLoading}
                  />
                  <FaKey className="absolute left-3 top-2.5 sm:top-3 text-gray-400 text-sm" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 sm:top-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? 
                      <FaEyeSlash className="text-sm sm:text-base" /> : 
                      <FaEye className="text-sm sm:text-base" />
                    }
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <span>⚠</span> {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                isLoading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  {isLoginMode ? 'Signing in...' : 'Creating Account...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {isLoginMode ? <FaSignInAlt /> : <FaUserPlus />}
                  {isLoginMode ? 'Sign In' : 'Create Account'}
                </div>
              )}
            </button>
          </form>

          {/* Toggle between Login/Register */}
          <div className="mt-6 pt-5 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={toggleMode}
                disabled={isLoading}
                className="ml-2 font-semibold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50 text-sm"
              >
                {isLoginMode ? 'Create one here' : 'Sign in here'}
              </button>
            </p>
          </div>

          {/* Demo Credentials Hint */}
          <div className="mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-100">
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              <span className="font-semibold text-emerald-700">Demo:</span> Try with email: demo@hotel.com / password: demo123
            </p>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              <FaBuilding className="inline mr-1" />
              Hotel Management System © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Image Section - Show on small screens but smaller */}
      <div className="lg:hidden mt-8 w-full max-w-xs mx-auto">
        <div className="relative">
          <img 
            src={hotel}
            alt="Hotel" 
            className="w-full h-auto rounded-xl shadow-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


// Mobile-First Design:
// Extra Small Screens (< 640px): Compact layout with smaller text, tighter spacing

// Small Screens (640px - 768px): Balanced layout with medium-sized elements

// Medium Screens (768px - 1024px): Enhanced layout with more spacing

// Large Screens (> 1024px): Full desktop layout with image side-by-side

// // combine both registration and login into one component. Here's the updated TypeScript version of LoginPage
// import React, { useState } from 'react'
// import { useMutation } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom'
// import { useDispatch } from 'react-redux';
// import { enqueueSnackbar } from 'notistack';
// import { GiFastBackwardButton } from "react-icons/gi";
// import { login, register } from '../https';
// import { setUser } from '../redux/slices/userSlice';
// import hotel from '../assets/images/hotel.jpg' 

// const LoginPage = () => {
//     const [isLoginMode, setIsLoginMode] = useState(true);
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "", 
//         phone: "", 
//         password: "", 
//         role: ""
//     });
//     const [loginData, setLoginData] = useState({
//         email: "",
//         password: ""
//     });

//     const navigate = useNavigate();
//     const dispatch = useDispatch();

//     const handleChange = (e) => {
//         if (isLoginMode) {
//             setLoginData({...loginData, [e.target.name]: e.target.value});
//         } else {
//             setFormData({...formData, [e.target.name]: e.target.value});
//         }
//     }

//     const handleRoleSelection = (selectedRole) => {
//         setFormData({...formData, role: selectedRole});
//     }

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (isLoginMode) {
//             loginMutation.mutate(loginData);
//         } else {
//             registerMutation.mutate(formData);
//         }
//     }

//     // Registration mutation
//     const registerMutation = useMutation({
//         mutationFn: (reqData) => register(reqData),
//         onSuccess: (res) => {
//             const { data } = res;
//             enqueueSnackbar(data.message, { variant: "success" });
//             setFormData({
//                 name: "",
//                 email: "",
//                 phone: "",
//                 password: "",
//                 role: "",
//             });
//             setTimeout(() => {
//                 setIsLoginMode(true);
//             }, 1500);
//         },
//         onError: (error) => {
//             const { response } = error;
//             enqueueSnackbar(response.data.message, { variant: "error" });
//         }
//     });

//     // Login mutation
//     const loginMutation = useMutation({
//         mutationFn: (reqData) => login(reqData),
//         onSuccess: (res) => {
//             const { data } = res;
//             const { _id, name, email, phone, role } = data.data;
//             dispatch(setUser({ _id, name, email, phone, role }));
//             navigate('/');
//         },
//         onError: (error) => {
//             const { response } = error;
//             enqueueSnackbar(response.data.message, { variant: "error" });
//         }
//     });

//     return (
//         <div className='min-h-screen flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col max-sm:gap-1 max-sm:items-center sm:px-25'>
//             {/* Left side image */}
//             <img 
//                 src={hotel}
//                 alt="" 
//                 className='w-[400px] max-sm:w-[100px] cursor-pointer hidden md:block' 
//             />

//             {/* Right side form */}
//             <div className='md:w-[500px] border-2 bg-white/8 text-[#1a1a1a] border-gray-200 p-6 flex flex-col gap-6 rounded-lg shadow-lg cursor-pointer'>
//                 <h2 className='font-bold text-2xl flex justify-between items-center text-gray-500'>
//                     {isLoginMode ? 'Login' : 'Register'}
//                     {/* {!isLoginMode && (
//                         <GiFastBackwardButton
//                             onClick={() => setIsLoginMode(true)}
//                             className='inline ml-2 text-emerald-600 cursor-pointer' 
//                         />
//                     )} */}
//                 </h2>

//                 <form onSubmit={handleSubmit}>
//                     {/* Registration fields */}
//                     {!isLoginMode && (
//                         <>
//                             <div className='mb-4'>
//                                 <input
//                                     type='text'
//                                     name='name'
//                                     value={formData.name}
//                                     onChange={handleChange}
//                                     placeholder='Full Name'
//                                     className='w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400'
//                                     required
//                                 />
//                             </div>

//                             <div className='mb-4'>
//                                 <input
//                                     type='tel'
//                                     name='phone'
//                                     value={formData.phone}
//                                     onChange={handleChange}
//                                     placeholder='Phone Number'
//                                     className='w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400'
//                                     required
//                                 />
//                             </div>

//                             <div className='mb-4'>
//                                 <label className='block text-[#1a1a1a] mb-2 text-sm font-medium'>Choose your role</label>
//                                 <div className='flex items-center gap-3'>
//                                     {['Admin', 'Cashier', 'Services'].map((role) => (
//                                         <button
//                                             key={role}
//                                             type='button'
//                                             onClick={() => handleRoleSelection(role)}
//                                             className={`px-3 py-2 w-full cursor-pointer rounded-lg shadow-lg/30 text-xs font-semibold  
//                                             ${formData.role === role ? "bg-emerald-600 text-white" : "bg-white text-emerald-700"}`}
//                                         >
//                                             {role}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>
//                         </>
//                     )}

//                     {/* Common fields (email & password) */}
//                     <div className='mb-4'>
//                         <input
//                             type='email'
//                             name='email'
//                             value={isLoginMode ? loginData.email : formData.email}
//                             onChange={handleChange}
//                             placeholder='Email Address'
//                             className='w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400'
//                             required
//                         />
//                     </div>

//                     <div className='mb-6'>
//                         <input
//                             type='password'
//                             name='password'
//                             value={isLoginMode ? loginData.password : formData.password}
//                             onChange={handleChange}
//                             placeholder='Password'
//                             className='w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400'
//                             required
//                         />
//                     </div>

//                     <button
//                         type='submit'
//                         disabled={isLoginMode ? loginMutation.isLoading : registerMutation.isLoading}
//                         className='bg-gradient-to-r from-emerald-600 to-emerald-400 p-3 text-white rounded-sm cursor-pointer w-full disabled:opacity-50'
//                     >
//                         {isLoginMode 
//                             ? (loginMutation.isLoading ? 'Signing in...' : 'Login Now') 
//                             : (registerMutation.isLoading ? 'Creating Account...' : 'Create Account')
//                         }
//                     </button>
//                 </form>

//                 <div className='flex flex-col gap-2'>
//                     {isLoginMode ? (
//                         <p className='text-sm text-gray-400'>
//                             Create a new account
//                             <span
//                                 onClick={() => setIsLoginMode(false)}
//                                 className='font-bold text-emerald-600 cursor-pointer ml-1'
//                             >
//                                 Click here
//                             </span>
//                         </p>
//                     ) : (
//                         <p className='text-sm text-gray-400'>
//                             Already have an account?
//                             <span
//                                 onClick={() => setIsLoginMode(true)}
//                                 className='font-bold text-emerald-600 cursor-pointer ml-1'
//                             >
//                                 Login here
//                             </span>
//                         </p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoginPage;