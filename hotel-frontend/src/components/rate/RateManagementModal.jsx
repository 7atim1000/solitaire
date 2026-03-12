import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaTimes, 
  FaPlus, 
  FaEdit, 
  FaDollarSign, 
  FaCheck, 
  FaClock,
  FaCalendarAlt,
  FaBuilding,
  FaTag,
  FaInfoCircle,
  FaSave,
  FaTimesCircle
} from 'react-icons/fa';
import { 
  FiUpload, 
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  MdDescription,
  MdAttachMoney,
  MdEventAvailable,
  MdEventBusy
} from 'react-icons/md';
import { rateService } from '../../https';

export const RateManagementModal = ({ open, setOpen, refreshRates }) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rateType: 'hourly',
    rateAmount: '',
    currency: 'USD',
    isActive: true,
    minDuration: 1,
    maxDuration: null,
    appliesTo: 'all'
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Fetch rates when modal opens
  useEffect(() => {
    if (open) {
      fetchRates();
      resetForm();
    }
  }, [open]);

  // Fetch all rates
  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await rateService.getRates();
      setRates(response.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch rates');
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // if (!formData.name.trim()) {
    //   newErrors.name = 'Name is required';
    // }
    
    if (!formData.rateAmount || isNaN(formData.rateAmount) || parseFloat(formData.rateAmount) <= 0) {
      newErrors.rateAmount = 'Valid amount is required';
    }
    
    // if (!formData.rateType) {
    //   newErrors.rateType = 'Rate type is required';
    // }
    
    if (formData.minDuration && formData.maxDuration && 
        parseInt(formData.minDuration) > parseInt(formData.maxDuration)) {
      newErrors.maxDuration = 'Max duration must be greater than min duration';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rateType: 'hourly',
      rateAmount: '',
      currency: 'USD',
      isActive: true,
      minDuration: 1,
      maxDuration: null,
      appliesTo: 'all'
    });
    setErrors({});
    setIsAdding(false);
    setIsEditing(false);
    setSelectedRate(null);
  };

  // Handle form submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      const rateData = {
        ...formData,
        rateAmount: parseFloat(formData.rateAmount),
        minDuration: parseInt(formData.minDuration),
        maxDuration: formData.maxDuration ? parseInt(formData.maxDuration) : null
      };
      
      let response;
      
      if (isEditing && selectedRate) {
        // Update existing rate
        response = await rateService.updateRate(selectedRate._id, rateData);
        toast.success('Rate updated successfully!');
      } else {
        // Add new rate
        response = await rateService.addRate(rateData);
        toast.success('Rate added successfully!');
      }
      
      // Refresh rates list
      fetchRates();
      resetForm();
      
      // Notify parent component if needed
      if (refreshRates) {
        refreshRates();
      }
      
    } catch (error) {
      console.error('Error saving rate:', error);
      toast.error(error.message || 'Failed to save rate');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (rate) => {
    setSelectedRate(rate);
    setIsEditing(true);
    setIsAdding(false);
    
    setFormData({
      name: rate.name || '',
      description: rate.description || '',
      rateType: rate.rateType || 'hourly',
      rateAmount: rate.rateAmount || '',
      currency: rate.currency || 'USD',
      isActive: rate.isActive !== undefined ? rate.isActive : true,
      minDuration: rate.minDuration || 1,
      maxDuration: rate.maxDuration || null,
      appliesTo: rate.appliesTo || 'all'
    });
  };

  // Close modal
  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  // Rate type options
  const rateTypeOptions = [
    { value: 'hourly', label: 'Hourly', icon: <FaClock className="inline mr-2" /> },
    { value: 'daily', label: 'Daily', icon: <FaCalendarAlt className="inline mr-2" /> },
    { value: 'weekly', label: 'Weekly', icon: <MdDescription className="inline mr-2" /> },
    { value: 'monthly', label: 'Monthly', icon: <FaBuilding className="inline mr-2" /> },
    { value: 'custom', label: 'Custom', icon: <FaTag className="inline mr-2" /> }
  ];

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'USD ($)', icon: <FaDollarSign className="inline mr-2" /> },
    { value: 'EUR', label: 'EUR (€)', icon: '€' },
    { value: 'GBP', label: 'GBP (£)', icon: '£' },
    { value: 'AED', label: 'AED (د.إ)', icon: 'د.إ' },
    { value: 'INR', label: 'INR (₹)', icon: '₹' }
  ];

  // Applies to options
  const appliesToOptions = [
    { value: 'all', label: 'All Services/Rooms', icon: <FaCheck className="inline mr-2" /> },
    { value: 'specific_room', label: 'Specific Room', icon: <FaBuilding className="inline mr-2" /> },
    { value: 'specific_service', label: 'Specific Service', icon: <FaTag className="inline mr-2" /> }
  ];

  // If modal is not open, don't render anything
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-opacity-50 transition-opacity"
        onClick={handleClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
     />
      
      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen p-4" >
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MdAttachMoney className="text-emerald-600" />
                Rate Management
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Add, edit, and manage your rates
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              aria-label="Close"
            >
              <FaTimes className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* Body */}
          <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
            {/* Left side: Rates List */}
            <div className="lg:w-2/5 border-r border-gray-200 p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                  <FiRefreshCw />
                  Rates List
                </h3>
                <button
                  onClick={() => {
                    resetForm();
                    setIsAdding(true);
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md"
                >
                  <FaPlus className="h-4 w-4" />
                  Add New Rate
                </button>
              </div>
              
              {loading && rates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto"></div>
                  <p className="text-gray-500 mt-3">Loading rates...</p>
                </div>
              ) : rates.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <FaDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No rates found</p>
                  <button
                    onClick={() => setIsAdding(true)}
                    className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-2 mx-auto"
                  >
                    <FaPlus />
                    Add your first rate
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {rates.map((rate) => (
                    <div
                      key={rate._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                        selectedRate?._id === rate._id
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-white ring-2 ring-emerald-100'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                      onClick={() => handleEdit(rate)}
                    >
                      {/* <div className="flex justify-between items-start"> */}
                        {/* <div className="flex-1"> */}
                          {/* <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{rate.name}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              rate.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {rate.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div> */}
                          
                          {/* {rate.description && (
                            <p className="text-sm text-gray-600 mt-2 flex items-start gap-1">
                              <FaInfoCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span className="flex-1">{rate.description}</span>
                            </p>
                          )} */}
                          
                          {/* <div className="flex flex-wrap gap-2 mt-3"> */}
                            {/* <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {rate.rateType}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                              {rate.appliesTo.replace('_', ' ')}
                            </span> */}
                            {/* <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                              Min: {rate.minDuration} {rate.rateType}
                            </span> */}
                          {/* </div> */}
                        {/* </div> */}
                        
                        <div className="flex flex-col md:flex-row md:justify-between items-end ml-4">
                          <div className="text-xl font-bold text-gray-900 whitespace-nowrap">
                            {rate.currency} {rate.rateAmount.toFixed(2)}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(rate);
                            }}
                            className="cursor-pointer mt-3 p-2 bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-600 rounded-full transition-colors"
                            aria-label="Edit rate"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                        </div>
                      {/* </div> */}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right side: Form */}
            <div className="lg:w-3/5 p-6 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <FaEdit className="text-emerald-600" />
                      Edit Rate
                    </>
                  ) : isAdding ? (
                    <>
                      <FaPlus className="text-emerald-600" />
                      Add New Rate
                    </>
                  ) : (
                    <>
                      <FaInfoCircle className="text-blue-600" />
                      Rate Details
                    </>
                  )}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isEditing ? 'Update rate details below' : 
                   isAdding ? 'Fill in the details to add a new rate' : 
                   'Select a rate to edit or add a new one'}
                </p>
              </div>
              
              {(!isAdding && !isEditing) ? (
                <div className="text-center py-16">
                  <div className="text-gray-300 mb-6">
                    <FaDollarSign className="h-20 w-20 mx-auto" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No rate selected</h4>
                  <p className="text-gray-500 mb-6">Select a rate from the list or create a new one</p>
                  <button
                    onClick={() => {
                      resetForm();
                      setIsAdding(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg"
                  >
                    <FaPlus />
                    Create New Rate
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaTag className="text-emerald-600" />
                      Rate Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
                      }`}
                      placeholder="e.g., Standard Room Rate, Premium Service Rate"
                    />
                    {errors.name && (
                      <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                        <FaTimesCircle />
                        <span>{errors.name}</span>
                      </div>
                    )}
                  </div> */}
                  
                  {/* Description */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MdDescription className="text-emerald-600" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-emerald-400"
                      placeholder="Describe this rate (optional)..."
                    />
                  </div> */}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Rate Type */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaClock className="text-emerald-600" />
                        Rate Type *
                      </label>
                      <div className="relative">
                        <select
                          name="rateType"
                          value={formData.rateType}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-all ${
                            errors.rateType ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
                          }`}
                        >
                          {rateTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <FaClock className="text-gray-400" />
                        </div>
                      </div>
                      {errors.rateType && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                          <FaTimesCircle />
                          <span>{errors.rateType}</span>
                        </div>
                      )}
                    </div> */}
                    
                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaDollarSign className="text-emerald-600" />
                        Currency *
                      </label>
                      <div className="relative">
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none transition-all hover:border-emerald-400"
                        >
                          {currencyOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.icon} {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <FaDollarSign className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MdAttachMoney className="text-emerald-600" />
                      Amount *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-700 font-medium">{formData.currency}</span>
                      </div>
                      <input
                        type="number"
                        name="rateAmount"
                        value={formData.rateAmount}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className={`w-full pl-16 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                          errors.amount ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.amount && (
                      <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                        <FaTimesCircle />
                        <span>{errors.amount}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6    mb-0">
                    {/* Min Duration */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MdEventAvailable className="text-emerald-600" />
                        Minimum Duration
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="minDuration"
                          value={formData.minDuration}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-emerald-400"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">
                            {formData.rateType === 'hourly' ? 'hours' : 
                             formData.rateType === 'daily' ? 'days' : 
                             formData.rateType === 'weekly' ? 'weeks' : 'months'}
                          </span>
                        </div>
                      </div>
                    </div> */}
                    
                    {/* Max Duration */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <MdEventBusy className="text-emerald-600" />
                        Maximum Duration (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="maxDuration"
                          value={formData.maxDuration || ''}
                          onChange={handleInputChange}
                          min="1"
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                            errors.maxDuration ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
                          }`}
                          placeholder="No limit"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">
                            {formData.rateType === 'hourly' ? 'hours' : 
                             formData.rateType === 'daily' ? 'days' : 
                             formData.rateType === 'weekly' ? 'weeks' : 'months'}
                          </span>
                        </div>
                      </div>
                      {errors.maxDuration && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                          <FaTimesCircle />
                          <span>{errors.maxDuration}</span>
                        </div>
                      )}
                    </div> */}
                  </div>
                  
                  {/* Applies To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaBuilding className="text-emerald-600" />
                      Applies To
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {appliesToOptions.map(option => (
                        <label
                          key={option.value}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.appliesTo === option.value
                              ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100'
                              : 'border-gray-300 hover:border-emerald-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="appliesTo"
                            value={option.value}
                            checked={formData.appliesTo === option.value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <div className="flex items-center gap-2">
                              {option.icon}
                              <span className="font-medium text-gray-900">{option.label}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Active Status */}
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-0">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-3 flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm text-gray-700">
                        This rate is currently <span className="font-medium">{formData.isActive ? 'active' : 'inactive'}</span>
                      </span>
                    </label>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2 font-medium"
                      disabled={loading}
                    >
                      <FaTimes />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {isEditing ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        <>
                          <FaSave />
                          {isEditing ? 'Update Rate' : 'Add Rate'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateManagementModal;