import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '../../https';
import { useSelector } from 'react-redux';

const AddRoom = ({ setIsAddRoomModal, fetchRooms }) => {
  const handleClose = () => {
    setIsAddRoomModal(false);
  };

  const rateData = useSelector(state => state.rate);
  
  // State for form fields
  const [roomNo, setRoomNo] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [floor, setFloor] = useState('');
  const [dolPriceOne, setDolPriceOne] = useState('');
  const [dolPriceTow, setDolPriceTow] = useState('');
  const [rate, setRate] = useState('');
  const [priceOne, setPriceOne] = useState('');
  const [priceTow, setPriceTow] = useState('');
  const [description, setDescription] = useState('');
  const [roomImage, setRoomImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for dropdown options
  const [rates, setRates] = useState([]);
  const [floors, setFloors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Calculate price whenever dolPrice or rate changes
  useEffect(() => {
    if (dolPriceOne && rate) {
      const dol = parseFloat(dolPriceOne);
      const rte = parseFloat(rate);
      if (!isNaN(dol) && !isNaN(rte)) {
        const calculatedPrice = dol * rte;
        setPriceOne(calculatedPrice.toFixed(2));
      }
    } else {
      setPriceOne('');
    }
  }, [dolPriceOne, rate]);

  useEffect(() => {
    if (dolPriceTow && rate) {
      const dol = parseFloat(dolPriceTow);
      const rte = parseFloat(rate);
      if (!isNaN(dol) && !isNaN(rte)) {
        const calculatedPrice = dol * rte;
        setPriceTow(calculatedPrice.toFixed(2));
      }
    } else {
      setPriceTow('');
    }
  }, [dolPriceTow, rate]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (setIsAddRoomModal) {
      setRoomNo('');
      setStatus('');
      setCategory('');
      setFloor('');
      setDolPriceOne('');
      setDolPriceTow('');
      setRate('');
      setPriceOne('');
      setPriceTow('');
      setDescription('');
      setRoomImage(null);
      setImagePreview(null);
      
      // Fetch data when modal opens
      fetchFloors();
      fetchCategories();
      fetchRates();
    }
  }, [setIsAddRoomModal]);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setRoomImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setRoomImage(null);
    setImagePreview(null);
  };

  const fetchRates = async () => {
    setLoadingData(true);
    try {
      const response = await api.get('/api/rate');
      if (response.data.success) {
        setRates(response.data.rates);
      } else {
        toast.error(response.data.message || 'Failed to load rates');
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch rates');
    } finally {
      setLoadingData(false);
    }
  }

  // Fetch floors
  const fetchFloors = async () => {
    setLoadingData(true);
    try {
      const response = await api.get('/api/floor/');
      if (response.data.success) {
        setFloors(response.data.floors);
      } else {
        toast.error(response.data.message || 'Failed to load floors');
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch floors');
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoadingData(true);
    try {
      const response = await api.get('/api/category/');
      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        toast.error(response.data.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoadingData(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation - IMAGE IS NOW OPTIONAL (removed roomImage validation)
    if (!roomNo.trim()) {
      toast.error('Room number is required');
      return;
    }
    // if (!seats || parseInt(seats) <= 0) {
    //   toast.error('Valid number of seats is required');
    //   return;
    // }
    if (!category) {
      toast.error('Category is required');
      return;
    }
    if (!floor) {
      toast.error('Floor is required');
      return;
    }
    if (!dolPriceOne || parseFloat(dolPriceOne) <= 0) {
      toast.error('Valid dollar price for one person is required');
      return;
    }
    if (!dolPriceTow || parseFloat(dolPriceTow) <= 0) {
      toast.error('Valid dollar price for two persons is required');
      return;
    }
    if (!rate || parseFloat(rate) <= 0) {
      toast.error('Valid rate is required');
      return;
    }
    if (!priceOne || parseFloat(priceOne) <= 0) {
      toast.error('Price calculation failed. Please check dollar price and rate.');
      return;
    }
    if (!priceTow || parseFloat(priceTow) <= 0) {
      toast.error('Price calculation failed. Please check dollar price and rate.');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload (image is optional)
      const formData = new FormData();
      formData.append('roomNo', roomNo.trim());
      formData.append('status', status);
      formData.append('category', category);
      formData.append('floor', floor);
      formData.append('dolPriceOne', dolPriceOne);
      formData.append('dolPriceTow', dolPriceTow);
      formData.append('rate', rate);
      formData.append('priceOne', priceOne);
      formData.append('priceTow', priceTow);
      formData.append('description', description.trim());
      
      // Append image only if exists
      if (roomImage) {
        formData.append('image', roomImage);
      }

      const { data } = await api.post('/api/room', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        toast.success(data.message || 'Room added successfully!');

        // Reset form
        setRoomNo('');
        setStatus('');
        setCategory('');
        setFloor('');
        setDolPriceOne('');
        setDolPriceTow('');
        setRate('');
        setPriceOne('');
        setPriceTow('');
        setDescription('');
        setRoomImage(null);
        setImagePreview(null);

        // Close modal
        handleClose();

        // Refresh rooms list
        if (fetchRooms) {
          await fetchRooms();
        }
      } else {
        toast.error(data.message || 'Failed to add new room');
      }
    } catch (error) {
      console.error('Error adding room:', error);

      // Enhanced error handling for toast notifications
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add room. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Add keyboard shortcut (Escape to close)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && setIsAddRoomModal) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setIsAddRoomModal]);

  // Don't render if not open
  if (!setIsAddRoomModal) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 overflow-y-auto py-4"
      style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add New Room</h2>
          <h2 className="text-xl font-semibold text-gray-800">{rateData.rateAmount}</h2>

          <button
            onClick={handleClose}
            className="text-gray-600 font-bold hover:text-[#be3e3f] text-2xl cursor-pointer"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Image Upload - NOW OPTIONAL */}
            <div className="mb-4 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Image (Optional)
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <label
                  htmlFor="roomImage"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  {roomImage ? 'Change Image' : 'Choose Image'}
                </label>
                <input
                  type="file"
                  id="roomImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
                {roomImage && (
                  <span className="text-sm text-gray-600">
                    Selected: {roomImage.name}
                  </span>
                )}
                {roomImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-sm text-red-600 hover:text-red-800"
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, etc.
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                ✓ Optional - You can add an image later
              </p>
            </div>

            {/* Room Number */}
            <div className="mb-4">
              <label htmlFor="roomNo" className="block text-sm font-medium text-gray-700 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                id="roomNo"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter room number"
                required
                disabled={loading}
              />
            </div>

            {/* Status Selection */}
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={loading || loadingData}
              >
                <option value="">Select Status</option>
                <option value="available" className="text-green-600 font-medium">
                  ✅ Available
                </option>
                <option value="booked" className="text-blue-600 font-medium">
                  📅 Booked
                </option>
                <option value="blocked" className="text-red-600 font-medium">
                  ⛔ Blocked
                </option>
                <option value="outofservice" className="text-red-600 font-medium">
                  ⛔ Out of Service
                </option>
                <option value="cleaning" className="text-[#1a1a1a] font-medium">
                  ✅ cleaning
                </option>
                <option value="maintenance" className="text-[#1a1a1a] font-medium">
                  ✅ maintenance
                </option>
                <option value="occupied" className="text-[#1a1a1a] font-medium">
                  ✅ occupied
                </option>
              </select>

              {loadingData && (
                <p className="text-xs text-gray-500 mt-1">Loading status...</p>
              )}
            </div>


            {/* Category Selection */}
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={loading || loadingData}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat.categoryName || cat.name}>
                    {cat.categoryName || cat.name}
                  </option>
                ))}

                
              </select>
              {categories.length === 0 && !loadingData && (
                <p className="text-xs text-gray-500 mt-1">No categories available</p>
              )}
              {loadingData && (
                <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
              )}
            </div>

            {/* Floor Selection */}
            <div className="mb-4">
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Floor *
              </label>
              <select
                id="floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={loading || loadingData}
              >
                <option value="">Select Floor</option>
                {floors.map((floorItem) => (
                  <option key={floorItem._id || floorItem.id} value={floorItem.floorName || floorItem.name}>
                    {floorItem.floorName || floorItem.name}
                  </option>
                ))}
              </select>
              {floors.length === 0 && !loadingData && (
                <p className="text-xs text-gray-500 mt-1">No floors available</p>
              )}
              {loadingData && (
                <p className="text-xs text-gray-500 mt-1">Loading floors...</p>
              )}
            </div>

            {/* Dollar Price For One Person */}
            <div className="mb-4">
              <label htmlFor="dolPriceOne" className="block text-sm font-medium text-gray-700 mb-1">
                Dollar Price (One Person) *
              </label>
              <input
                type="number"
                id="dolPriceOne"
                value={dolPriceOne}
                onChange={(e) => setDolPriceOne(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
              <p className="text-xs text-green-600 mt-1">Price per person in USD</p>
            </div>

            {/* Dollar Price For Two Persons */}
            <div className="mb-4">
              <label htmlFor="dolPriceTow" className="block text-sm font-medium text-gray-700 mb-1">
                Dollar Price (Two Persons) *
              </label>
              <input
                type="number"
                id="dolPriceTow"
                value={dolPriceTow}
                onChange={(e) => setDolPriceTow(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
              <p className="text-xs text-green-600 mt-1">Price for two persons in USD</p>
            </div>

            {/* Rate */}
            <div className="mb-4">
              <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
                Exchange Rate *
              </label>
              <select
                id="rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                disabled={loading || loadingData}
              >
                <option value="">Select Exchange Rate</option>
                {rates.map((rateItem) => (
                  <option key={rateItem._id || rateItem.id} value={rateItem.rateAmount}>
                    {rateItem.rateAmount} ({rateItem.currency || 'USD to SD'})
                  </option>
                ))}
              </select>
              {rates.length === 0 && !loadingData && (
                <p className="text-xs text-gray-500 mt-1">No rates available</p>
              )}
              {loadingData && (
                <p className="text-xs text-gray-500 mt-1">Loading rates...</p>
              )}
            </div>

            {/* Calculated Price One Person */}
            <div className="mb-4">
              <label htmlFor="priceOne" className="block text-sm font-medium text-gray-700 mb-1">
                Calculated Price (One Person) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="priceOne"
                  value={priceOne}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  SD
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Auto-calculated: {dolPriceOne || '0'} USD × {rate || '0'} = {priceOne || '0'} SD
              </p>
            </div>

            {/* Calculated Price Two Persons */}
            <div className="mb-4">
              <label htmlFor="priceTow" className="block text-sm font-medium text-gray-700 mb-1">
                Calculated Price (Two Persons) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="priceTow"
                  value={priceTow}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  SD
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Auto-calculated: {dolPriceTow || '0'} USD × {rate || '0'} = {priceTow || '0'} SD
              </p>
            </div>

            {/* Description */}
            <div className="mb-4 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter room description"
                rows="3"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Modal Footer - Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-semibold text-[#be3e3f] bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !priceOne || !priceTow}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                'Add Room'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddRoom;



// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { IoCloseCircle } from 'react-icons/io5';
// import { toast } from 'react-hot-toast';
// import { api } from '../../https';
// import { useSelector } from 'react-redux';

// const AddRoom = ({ setIsAddRoomModal, fetchRooms }) => {
//   const handleClose = () => {
//     setIsAddRoomModal(false);
//   };

//   const rateData = useSelector(state => state.rate);
//   // State for form fields
//   const [roomNo, setRoomNo] = useState('');
//   const [seats, setSeats] = useState('');
//   const [category, setCategory] = useState('');
//   const [floor, setFloor] = useState('');
//   const [dolPriceOne, setDolPriceOne] = useState('');
//   const [dolPriceTow, setDolPriceTow] = useState('');
//   const [rate, setRate] = useState('');
//   const [priceOne, setPriceOne] = useState('');
//   const [priceTow, setPriceTow] = useState('');
//   const [description, setDescription] = useState('');
//   const [roomImage, setRoomImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [loading, setLoading] = useState(false);
  
//   // State for dropdown options
//   const [rates, setRates] = useState([]);
//   const [floors, setFloors] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loadingData, setLoadingData] = useState(false);

//   // Calculate price whenever dolPrice or rate changes
//   useEffect(() => {
//     if (dolPriceOne && rate) {
//       const dol = parseFloat(dolPriceOne);
//       const rte = parseFloat(rate);
//       if (!isNaN(dol) && !isNaN(rte)) {
//         const calculatedPrice = dol * rte;
//         setPriceOne(calculatedPrice.toFixed(2));
//       }
//     } else {
//       setPriceOne('');
//     }
//   }, [dolPriceOne, rate]);

//   useEffect(() => {
//     if (dolPriceTow && rate) {
//       const dol = parseFloat(dolPriceTow);
//       const rte = parseFloat(rate);
//       if (!isNaN(dol) && !isNaN(rte)) {
//         const calculatedPrice = dol * rte;
//         setPriceTow(calculatedPrice.toFixed(2));
//       }
//     } else {
//       setPriceTow('');
//     }
//   }, [dolPriceOne, rate]);

//   // Reset form when modal opens/closes
//   useEffect(() => {
//     if (setIsAddRoomModal) {
//       setRoomNo('');
//       setSeats('');
//       setCategory('');
//       setFloor('');
//       setDolPriceOne('');
//       setDolPriceTow('');
//       setRate('');
//       setPriceOne('');
//       setPriceTow('');
//       setDescription('');
//       setRoomImage(null);
//       setImagePreview(null);
      
//       // Fetch data when modal opens
//       fetchFloors();
//       fetchCategories();
//       fetchRates();
//     }
//   }, [setIsAddRoomModal]);

//   // Handle image upload
//   const handleImageChange = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       // Check file type
//       if (!file.type.startsWith('image/')) {
//         toast.error('Please select an image file');
//         return;
//       }
      
//       // Check file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error('Image size should be less than 5MB');
//         return;
//       }
      
//       setRoomImage(file);
      
//       // Create preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Remove selected image
//   const removeImage = () => {
//     setRoomImage(null);
//     setImagePreview(null);
//   };

  
//   const fetchRates = async () => {
//     setLoadingData(true);
//     try {
//       const response = await api.get('/api/rate');
//       //return response.data;
//       if (response.data.success) {
//         setRates(response.data.rates);
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.error('Error fetching rates:', error);
//       throw error.response?.data || { message: 'Failed to fetch rates' };
//     }
//   }

//   // Fetch floors
//   const fetchFloors = async () => {
//     setLoadingData(true);
//     try {
//       const response = await api.get('/api/floor/');
//       if (response.data.success) {
//         setFloors(response.data.floors);
//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       console.error('Error fetching floors:', error);
//       toast.error(error.message || 'Failed to fetch floors');
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   // Fetch categories
//   const fetchCategories = async () => {
//     setLoadingData(true);
//     try {
//       const response = await api.get('/api/category/');
//       if (response.data.success) {
//         setCategories(response.data.categories);
//       } else {
//         toast.error(response.data.message || 'Failed to fetch categories');
//       }
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       toast.error(error.message || 'Failed to fetch categories');
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation
//     if (!roomNo.trim()) {
//       toast.error('Room number is required');
//       return;
//     }
//     if (!seats || parseInt(seats) <= 0) {
//       toast.error('Valid number of seats is required');
//       return;
//     }
//     if (!category) {
//       toast.error('Category is required');
//       return;
//     }
//     if (!floor) {
//       toast.error('Floor is required');
//       return;
//     }
//     if (!dolPriceOne || parseFloat(dolPriceOne) <= 0) {
//       toast.error('Valid dollar price is required');
//       return;
//     }
//     if (!dolPriceTow || parseFloat(dolPriceTow) <= 0) {
//       toast.error('Valid dollar price is required');
//       return;
//     }
//     if (!rate || parseFloat(rate) <= 0) {
//       toast.error('Valid rate is required');
//       return;
//     }
//     if (!priceOne || parseFloat(priceOne) <= 0) {
//       toast.error('Price calculation failed. Please check dollar price and rate.');
//       return;
//     }
//      if (!priceTow || parseFloat(priceTow) <= 0) {
//       toast.error('Price calculation failed. Please check dollar price and rate.');
//       return;
//     }
//     if (!description.trim()) {
//       toast.error('Description is required');
//       return;
//     }
//     if (!roomImage) {
//       toast.error('Room image is required');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Create FormData for file upload
//       const formData = new FormData();
//       formData.append('roomNo', roomNo.trim());
//       formData.append('seats', seats);
//       formData.append('category', category);
//       formData.append('floor', floor);
//       formData.append('dolPriceOne', dolPriceOne);
//       formData.append('dolPriceTow', dolPriceTow);
//       formData.append('rate', rate);
//       formData.append('priceOne', priceOne);
//       formData.append('priceTow', priceTow);
//       formData.append('description', description.trim());
//       formData.append('image', roomImage);

//       const { data } = await api.post('/api/room', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (data.success) {
//         toast.success(data.message || 'Room added successfully!');

//         // Reset form
//         setRoomNo('');
//         setSeats('');
//         setCategory('');
//         setFloor('');
//         setDolPriceOne('');
//         setDolPriceTow('');
//         setRate('');
//         setPriceOne('');
//         setPriceTow('');
//         setDescription('');
//         setRoomImage(null);
//         setImagePreview(null);

//         // Close modal
//         handleClose();

//         // Refresh rooms list
//         if (fetchRooms) {
//           await fetchRooms();
//         }
//       } else {
//         toast.error(data.message || 'Failed to add new room');
//       }
//     } catch (error) {
//       console.error('Error adding room:', error);

//       // Handle different error types
//       if (error.response?.data?.message) {
//         toast.error(error.response.data.message);
//       } else if (error.message) {
//         toast.error(error.message);
//       } else {
//         toast.error('Failed to add room. Please try again.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Close modal when clicking outside
//   const handleBackdropClick = (e) => {
//     if (e.target === e.currentTarget) {
//       handleClose();
//     }
//   };

//   // Add keyboard shortcut (Escape to close)
//   useEffect(() => {
//     const handleEscape = (e) => {
//       if (e.key === 'Escape' && setIsAddRoomModal) {
//         handleClose();
//       }
//     };

//     document.addEventListener('keydown', handleEscape);
//     return () => document.removeEventListener('keydown', handleEscape);
//   }, [setIsAddRoomModal]);

//   // Don't render if not open
//   if (!setIsAddRoomModal) return null;

//   return (
//     <div
//       className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 overflow-y-auto py-4"
//       style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}
//       onClick={handleBackdropClick}
//     >
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.9 }}
//         transition={{ duration: 0.3, ease: 'easeInOut' }}
//         className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto"
//       >
//         {/* Modal Header */}
//         <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
//           <h2 className="text-xl font-semibold text-gray-800">Add New Room</h2>
//           <h2 className="text-xl font-semibold text-gray-800">{rateData.rateAmount}</h2>

//           <button
//             onClick={handleClose}
//             className="text-gray-600 font-bold hover:text-[#be3e3f] text-2xl cursor-pointer"
//             disabled={loading}
//           >
//             ×
//           </button>
//         </div>

//         {/* Modal Body - Form */}
//         <form onSubmit={handleSubmit} className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Room Image Upload */}
//             <div className="mb-4 md:col-span-2">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Room Image *
//               </label>
//               <div className="mt-1 flex items-center space-x-4">
//                 <label
//                   htmlFor="roomImage"
//                   className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
//                 >
//                   Choose Image
//                 </label>
//                 <input
//                   type="file"
//                   id="roomImage"
//                   accept="image/*"
//                   onChange={handleImageChange}
//                   className="hidden"
//                   disabled={loading}
//                 />
//                 {roomImage && (
//                   <span className="text-sm text-gray-600">
//                     Selected: {roomImage.name}
//                   </span>
//                 )}
//               </div>
              
//               {/* Image Preview */}
//               {imagePreview && (
//                 <div className="mt-4 relative">
//                   <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
//                   <div className="relative inline-block">
//                     <img
//                       src={imagePreview}
//                       alt="Preview"
//                       className="h-32 w-32 object-cover rounded-lg border border-gray-300"
//                     />
//                     <button
//                       type="button"
//                       onClick={removeImage}
//                       className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
//                       disabled={loading}
//                     >
//                       ×
//                     </button>
//                   </div>
//                 </div>
//               )}
              
//               <p className="text-xs text-gray-500 mt-2">
//                 Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, etc.
//               </p>
//             </div>

//             {/* Room Number */}
//             <div className="mb-4">
//               <label htmlFor="roomNo" className="block text-sm font-medium text-gray-700 mb-1">
//                 Room Number *
//               </label>
//               <input
//                 type="text"
//                 id="roomNo"
//                 value={roomNo}
//                 onChange={(e) => setRoomNo(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 placeholder="Enter room number"
//                 required
//                 disabled={loading}
//               />
//             </div>

//             {/* Seats */}
//             <div className="mb-4">
//               <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-1">
//                 Seats *
//               </label>
//               <input
//                 type="number"
//                 id="seats"
//                 value={seats}
//                 onChange={(e) => setSeats(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 placeholder="Number of seats"
//                 min="1"
//                 required
//                 disabled={loading}
//               />
//             </div>

//             {/* Category Selection */}
//             <div className="mb-4">
//               <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
//                 Category *
//               </label>
//               <select
//                 id="category"
//                 value={category}
//                 onChange={(e) => setCategory(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 required
//                 disabled={loading || categories.length === 0}
//               >
//                 <option value="">Select Category</option>
//                 {categories.map((cat) => (
//                   <option key={cat._id || cat.id} value={cat._id || cat.id}>
//                     {cat.categoryName || cat.name}
//                   </option>
//                 ))}
//               </select>
//               {categories.length === 0 && !loadingData && (
//                 <p className="text-xs text-gray-500 mt-1">No categories available</p>
//               )}
//               {loadingData && (
//                 <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
//               )}
//             </div>

//             {/* Floor Selection */}
//             <div className="mb-4">
//               <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
//                 Floor *
//               </label>
//               <select
//                 id="floor"
//                 value={floor}
//                 onChange={(e) => setFloor(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 required
//                 disabled={loading || floors.length === 0}
//               >
//                 <option value="">Select Floor</option>
//                 {floors.map((floorItem) => (
//                   <option key={floorItem._id || floorItem.id} value={floorItem.floorName || floorItem.name}>
//                     {floorItem.floorName || floorItem.name}
//                   </option>
//                 ))}
//               </select>
//               {floors.length === 0 && !loadingData && (
//                 <p className="text-xs text-gray-500 mt-1">No floors available</p>
//               )}
//               {loadingData && (
//                 <p className="text-xs text-gray-500 mt-1">Loading floors...</p>
//               )}
//             </div>

//             {/* Dollar Price */}
//             <div className="mb-4">
//               <label htmlFor="dolPriceOne" className="block text-sm font-medium text-gray-700 mb-1">
//                 Dollar Price For One Person*
//               </label>
//               <input
//                 type="number"
//                 id="dolPriceOne"
//                 value={dolPriceOne}
//                 onChange={(e) => setDolPriceOne(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 placeholder="0.00"
//                 min="0"
//                 step="0.01"
//                 required
//                 disabled={loading}
//               />
//               <p className="text-xs text-gray-500 mt-1">One Person Price in USD</p>
//             </div>
//             <div className="mb-4">
//               <label htmlFor="dolPriceOne" className="block text-sm font-medium text-gray-700 mb-1">
//                 Dollar Price For Tow Person*
//               </label>
//               <input
//                 type="number"
//                 id="dolPriceTow"
//                 value={dolPriceTow}
//                 onChange={(e) => setDolPriceTow(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 placeholder="0.00"
//                 min="0"
//                 step="0.01"
//                 required
//                 disabled={loading}
//               />
//               <p className="text-xs text-gray-500 mt-1">Tow Person Price in USD</p>
//             </div>

//             {/* Rate */}
//             <div className="mb-4">
//               <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
//                 Rate Exchange *
//               </label>
//               <select
//                 id="rate"
//                 value={rate}
//                 onChange={(e) => setRate(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 required
//                 disabled={loading || rates.length === 0}
//               >
//                 <option value="">Select Rate Exchange</option>
//                 {rates.map((rate) => (
//                   <option key={rate._id || rate.id} value={rate.rateAmount}>
//                     {rate.rateAmount}
//                   </option>
//                 ))}
//               </select>
//               {rates.length === 0 && !loadingData && (
//                 <p className="text-xs text-gray-500 mt-1">No rates available</p>
//               )}
//               {loadingData && (
//                 <p className="text-xs text-gray-500 mt-1">Loading rates...</p>
//               )}
//             </div>
//             {/* <div className="mb-4">
//               <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
//                 Exchange Rate *
//               </label>
//               <input
//                 type="number"
//                 id="rate"
//                 value={rate}
//                 onChange={(e) => setRate(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 placeholder="0.00"
//                 min="0"
//                 step="0.01"
//                 required
//                 disabled={loading}
//               />
//               <p className="text-xs text-gray-500 mt-1">USD to Local Currency rate</p>
//             </div> */}

//             {/* Calculated Price One Person */}
//             <div className="mb-4">
//               <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
//                 Calculated Price For One Person *
//               </label>
//               <div className="relative">
//                 <input
//                   type="number"
//                   id="priceOne"
//                   value={priceOne}
//                   readOnly
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                   placeholder="0.00"
//                   required
//                   disabled={loading}
//                 />
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
//                   SD
//                 </div>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Auto-calculated: {dolPriceOne || '0'} USD × {rate || '0'} = {priceOne || '0'} SD
//               </p>
//               {dolPriceOne && rate && priceOne && (
//                 <div className="text-xs text-emerald-600 font-medium mt-1">
//                   ✓ Price calculated successfully
//                 </div>
//               )}
//             </div>
//             {/* Calculated Price Tow Person*/}
//             <div className="mb-4">
//               <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
//                 Calculated Price For Tow Person *
//               </label>
//               <div className="relative">
//                 <input
//                   type="number"
//                   id="priceTow"
//                   value={priceTow}
//                   readOnly
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                   placeholder="0.00"
//                   required
//                   disabled={loading}
//                 />
//                 <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
//                   SD
//                 </div>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Auto-calculated: {dolPriceTow || '0'} USD × {rate || '0'} = {priceTow || '0'} SD
//               </p>
//               {dolPriceTow && rate && priceTow && (
//                 <div className="text-xs text-emerald-600 font-medium mt-1">
//                   ✓ Price calculated successfully
//                 </div>
//               )}
//             </div>

//             {/* Description */}
//             <div className="mb-4 md:col-span-2">
//               <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//                 Description *
//               </label>
//               <textarea
//                 id="description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 placeholder="Enter room description"
//                 rows="3"
//                 required
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           {/* Modal Footer - Buttons */}
//           <div className="flex justify-end gap-3 pt-6 border-t mt-4">
//             <button
//               type="button"
//               onClick={handleClose}
//               className="px-4 py-2 text-sm font-semibold text-[#be3e3f] bg-gray-100 hover:bg-gray-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
//               disabled={loading}
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//               disabled={loading || !priceOne || parseFloat(priceOne) <= 0}
//             >
//               {loading ? (
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Adding...
//                 </div>
//               ) : (
//                 'Add Room'
//               )}
//             </button>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default AddRoom;