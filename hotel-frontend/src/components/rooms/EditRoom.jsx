import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import { api } from '../../https';

const EditRoom = ({ setIsEditRoomModal, room, fetchRooms }) => {
  const handleClose = () => {
    setIsEditRoomModal(false);
  };

  // State for form fields
  const [roomNo, setRoomNo] = useState(room.roomNo || '');
  const [status, setStatus] = useState(room.status || '');

  const [category, setCategory] = useState(room.category || '');
  const [floor, setFloor] = useState(room.floor || '');
  const [dolPriceOne, setDolPriceOne] = useState(room.dolPriceOne || '');
  const [dolPriceTow, setDolPriceTow] = useState(room.dolPriceTow || '');
  const [rate, setRate] = useState(room.rate || '');
  const [priceOne, setPriceOne] = useState(room.priceOne || '');
  const [priceTow, setPriceTow] = useState(room.priceTow || '');
  const [description, setDescription] = useState(room.description || '');
  const [roomImage, setRoomImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(room.image || null);
  const [loading, setLoading] = useState(false);
  
  // State for dropdown options
  const [rates, setRates] = useState([]);
  const [floors, setFloors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Initialize form with room data
  useEffect(() => {
    if (room) {
      setRoomNo(room.roomNo || '');
      setStatus(room.status || '');
      setCategory(room.category || '');
      setFloor(room.floor || '');
      setDolPriceOne(room.dolPriceOne || '');
      setDolPriceTow(room.dolPriceTow || '');
      setRate(room.rate || '');
      setPriceOne(room.priceOne || '');
      setPriceTow(room.priceTow || '');
      setDescription(room.description || '');
      setImagePreview(room.image || null);
      
      // Fetch data when modal opens
      fetchFloors();
      fetchCategories();
      fetchRates();
    }
  }, [room]);

  // Handle rate change and auto-calculate prices
  const handleRateChange = (e) => {
    const newRate = e.target.value;
    setRate(newRate);
    
    // Auto-calculate prices if dol prices are set
    if (dolPriceOne && dolPriceOne !== '' && newRate !== '') {
      const calculatedPriceOne = (parseFloat(dolPriceOne) * parseFloat(newRate)).toFixed(2);
      setPriceOne(calculatedPriceOne);
    }
    
    if (dolPriceTow && dolPriceTow !== '' && newRate !== '') {
      const calculatedPriceTow = (parseFloat(dolPriceTow) * parseFloat(newRate)).toFixed(2);
      setPriceTow(calculatedPriceTow);
    }
  };

  // Handle dolPriceOne change and auto-calculate priceOne
  const handleDolPriceOneChange = (e) => {
    const newDolPriceOne = e.target.value;
    setDolPriceOne(newDolPriceOne);
    
    // Auto-calculate priceOne if rate is set
    if (rate && rate !== '' && newDolPriceOne !== '') {
      const calculatedPriceOne = (parseFloat(newDolPriceOne) * parseFloat(rate)).toFixed(2);
      setPriceOne(calculatedPriceOne);
    }
  };

  // Handle dolPriceTow change and auto-calculate priceTow
  const handleDolPriceTowChange = (e) => {
    const newDolPriceTow = e.target.value;
    setDolPriceTow(newDolPriceTow);
    
    // Auto-calculate priceTow if rate is set
    if (rate && rate !== '' && newDolPriceTow !== '') {
      const calculatedPriceTow = (parseFloat(newDolPriceTow) * parseFloat(rate)).toFixed(2);
      setPriceTow(calculatedPriceTow);
    }
  };

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
    setImagePreview(room.image || null); // Reset to original image
  };

  // Fetch rates
  const fetchRates = async () => {
    setLoadingData(true);
    try {
      const response = await api.get('/api/rate');
      //return response.data;
      if (response.data.success) {
        setRates(response.data.rates);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      throw error.response?.data || { message: 'Failed to fetch rates' };
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
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
      toast.error(error.message || 'Failed to fetch floors');
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoadingData(true);
    try {
      const response = await api.get('/api/category/'); // Adjust endpoint as needed
      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        toast.error(response.data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || 'Failed to fetch categories');
    } finally {
      setLoadingData(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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
      toast.error('Valid dollar price is required');
      return;
    }
    if (!dolPriceTow || parseFloat(dolPriceTow) <= 0) {
      toast.error('Valid dollar price is required');
      return;
    }
    if (!rate || parseFloat(rate) <= 0) {
      toast.error('Valid rate is required');
      return;
    }
    if (!priceOne || parseFloat(priceOne) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!priceTow || parseFloat(priceTow) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
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
      
      if (roomImage) {
        formData.append('image', roomImage);
      }

      const { data } = await api.put(`/api/room/update/${room._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        toast.success(data.message || 'Room updated successfully!');

        // Close modal
        handleClose();

        // Refresh rooms list
        if (fetchRooms) {
          await fetchRooms();
        }
      } else {
        toast.error(data.message || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error updating room:', error);

      // Handle different error types
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update room. Please try again.');
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
      if (e.key === 'Escape' && setIsEditRoomModal) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setIsEditRoomModal]);

  // Don't render if not open
  if (!setIsEditRoomModal) return null;

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
          <h2 className="text-xl font-semibold text-gray-800">Edit Room - {room.roomNo}</h2>
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
            {/* Room Image Upload */}
            <div className="mb-4 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <label
                  htmlFor="roomImage"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Change Image
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
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4 relative">
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
                disabled={loading || categories.length === 0}
              >
                <option value="">Select Status</option>
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="blocked">Blocked</option>
                <option value="outofservice">Out of Service</option>
                <option value="maintenance">maintenance</option>
                <option value="cleaning">cleaning</option>
                <option value="occupied">occupied</option>
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
                disabled={loading || categories.length === 0}
              >
                
                {categories.map((cat) => (

                  <option key={cat._id || cat.id} value={cat.categoryName || cat.categoryName}>
                    {cat.categoryName || cat.categoryName}
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
                disabled={loading || floors.length === 0}
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

            {/* Dollar Price */}
            <div className="mb-4">
              <label htmlFor="dolPriceOne" className="block text-sm font-medium text-gray-700 mb-1">
                Dollar Price For One Person*
              </label>
              <input
                type="number"
                id="dolPriceOne"
                value={dolPriceOne}
                onChange={handleDolPriceOneChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="dolPriceTow" className="block text-sm font-medium text-gray-700 mb-1">
                Dollar Price For Two Persons*
              </label>
              <input
                type="number"
                id="dolPriceTow"
                value={dolPriceTow}
                onChange={handleDolPriceTowChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
                Rate *
              </label>
              <input
                type="number"
                id="rate"
                value={rate}
                onChange={handleRateChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            {/* Price */}
            <div className="mb-4">
              <label htmlFor="priceOne" className="block text-sm font-medium text-gray-700 mb-1">
                Price For One Person*
              </label>
              <input
                type="number"
                id="priceOne"
                value={priceOne}
                onChange={(e) => setPriceOne(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="priceTow" className="block text-sm font-medium text-gray-700 mb-1">
                Price For Two Persons*
              </label>
              <input
                type="number"
                id="priceTow"
                value={priceTow}
                onChange={(e) => setPriceTow(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
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
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                'Update Room'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditRoom;


// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { IoCloseCircle } from 'react-icons/io5';
// import { toast } from 'react-hot-toast';
// import { api } from '../../https';

// const EditRoom = ({ setIsEditRoomModal, room, fetchRooms }) => {
//   const handleClose = () => {
//     setIsEditRoomModal(false);
//   };

//   // State for form fields
//   const [roomNo, setRoomNo] = useState(room.roomNo || '');
//   const [status, setStatus] = useState(room.status || '');

//   const [category, setCategory] = useState(room.category || '');
//   const [floor, setFloor] = useState(room.floor || '');
//   const [dolPriceOne, setDolPriceOne] = useState(room.dolPriceOne || '');
//   const [dolPriceTow, setDolPriceTow] = useState(room.dolPriceTow || '');
//   const [rate, setRate] = useState(room.rate || '');
//   const [priceOne, setPriceOne] = useState(room.priceOne || '');
//   const [priceTow, setPriceTow] = useState(room.priceTow || '');
//   const [description, setDescription] = useState(room.description || '');
//   const [roomImage, setRoomImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(room.image || null);
//   const [loading, setLoading] = useState(false);
  
//   // State for dropdown options
//   const [rates, setRates] = useState([]);
//   const [floors, setFloors] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loadingData, setLoadingData] = useState(false);

//   // Initialize form with room data
//   useEffect(() => {
//     if (room) {
//       setRoomNo(room.roomNo || '');
//       setStatus(room.status || '');
//       setCategory(room.category || '');
//       setFloor(room.floor || '');
//       setDolPriceOne(room.dolPriceOne || '');
//       setDolPriceTow(room.dolPriceTow || '');
//       setRate(room.rate || '');
//       setPriceOne(room.priceOne || '');
//       setPriceTow(room.priceTow || '');
//       setDescription(room.description || '');
//       setImagePreview(room.image || null);
      
//       // Fetch data when modal opens
//       fetchFloors();
//       fetchCategories();
//       fetchRates();
//     }
//   }, [room]);

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
//     setImagePreview(room.image || null); // Reset to original image
//   };

//   // Fetch rates
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
//       const response = await api.get('/api/category/'); // Adjust endpoint as needed
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
//     // if (!seats || parseInt(seats) <= 0) {
//     //   toast.error('Valid number of seats is required');
//     //   return;
//     // }
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
//       toast.error('Valid price is required');
//       return;
//     }
//     if (!priceTow || parseFloat(priceTow) <= 0) {
//       toast.error('Valid price is required');
//       return;
//     }
//     if (!description.trim()) {
//       toast.error('Description is required');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Create FormData for file upload
//       const formData = new FormData();
//       formData.append('roomNo', roomNo.trim());
//       formData.append('status', status);
//       formData.append('category', category);
//       formData.append('floor', floor);
//       formData.append('dolPriceOne', dolPriceOne);
//       formData.append('dolPriceTow', dolPriceTow);
//       formData.append('rate', rate);
//       formData.append('priceOne', priceOne);
//       formData.append('priceTow', priceTow);
//       formData.append('description', description.trim());
      
//       if (roomImage) {
//         formData.append('image', roomImage);
//       }

//       const { data } = await api.put(`/api/room/update/${room._id}`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (data.success) {
//         toast.success(data.message || 'Room updated successfully!');

//         // Close modal
//         handleClose();

//         // Refresh rooms list
//         if (fetchRooms) {
//           await fetchRooms();
//         }
//       } else {
//         toast.error(data.message || 'Failed to update room');
//       }
//     } catch (error) {
//       console.error('Error updating room:', error);

//       // Handle different error types
//       if (error.response?.data?.message) {
//         toast.error(error.response.data.message);
//       } else if (error.message) {
//         toast.error(error.message);
//       } else {
//         toast.error('Failed to update room. Please try again.');
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
//       if (e.key === 'Escape' && setIsEditRoomModal) {
//         handleClose();
//       }
//     };

//     document.addEventListener('keydown', handleEscape);
//     return () => document.removeEventListener('keydown', handleEscape);
//   }, [setIsEditRoomModal]);

//   // Don't render if not open
//   if (!setIsEditRoomModal) return null;

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
//           <h2 className="text-xl font-semibold text-gray-800">Edit Room - {room.roomNo}</h2>
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
//                 Room Image
//               </label>
//               <div className="mt-1 flex items-center space-x-4">
//                 <label
//                   htmlFor="roomImage"
//                   className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
//                 >
//                   Change Image
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
   

//             {/* Status Selection */}
//             <div className="mb-4">
//               <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
//                 Status *
//               </label>
//               <select
//                 id="status"
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 bg-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 required
//                 disabled={loading || categories.length === 0}
//               >
//                 <option value="">Select Status</option>
//                 <option value="available">Available</option>
//                 <option value="booked">Booked</option>
//                 <option value="blocked">Blocked</option>
//                 <option value="outofservice">Out of Service</option>
//                 <option value="maintenance">maintenance</option>
//                 <option value="cleaning">cleaning</option>
//                 <option value="occupied">occupied</option>
//               </select>

//               {loadingData && (
//                 <p className="text-xs text-gray-500 mt-1">Loading status...</p>
//               )}
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
                
//                 {categories.map((cat) => (

//                   <option key={cat._id || cat.id} value={cat.categoryName || cat.categoryName}>
//                     {cat.categoryName || cat.categoryName}
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
//             </div>
//             <div className="mb-4">
//               <label htmlFor="dolPriceTow" className="block text-sm font-medium text-gray-700 mb-1">
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
//             </div>

//             <div className="mb-4">
//               <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
//                 Rate *
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
//             </div>

//             {/* Price */}
//             <div className="mb-4">
//               <label htmlFor="priceOne" className="block text-sm font-medium text-gray-700 mb-1">
//                 Price For One Person*
//               </label>
//               <input
//                 type="number"
//                 id="priceOne"
//                 value={priceOne}
//                 onChange={(e) => setPriceOne(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 placeholder="0.00"
//                 min="0"
//                 step="0.01"
//                 required
//                 disabled={loading}
//               />
//             </div>
//             <div className="mb-4">
//               <label htmlFor="priceTow" className="block text-sm font-medium text-gray-700 mb-1">
//                 Price For Tow Person*
//               </label>
//               <input
//                 type="number"
//                 id="priceTow"
//                 value={priceTow}
//                 onChange={(e) => setPriceTow(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
//                 placeholder="0.00"
//                 min="0"
//                 step="0.01"
//                 required
//                 disabled={loading}
//               />
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
//               disabled={loading}
//             >
//               {loading ? (
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Updating...
//                 </div>
//               ) : (
//                 'Update Room'
//               )}
//             </button>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default EditRoom;


