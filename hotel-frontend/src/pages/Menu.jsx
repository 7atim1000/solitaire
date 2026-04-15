import React, { useState, useRef, useEffect } from 'react'
import CustomerInfo from '../components/menu/CustomerInfo';
import CartInfo from '../components/menu/CartInfo';
import SelectCustomer from '../components/menu/SelectCustomer';
import BackButton from '../components/shared/BackButton';
import { HiMiniKey } from "react-icons/hi2";
import { IoMdArrowDropright } from "react-icons/io";
import { FaCircleUser } from "react-icons/fa6";
import { useSelector, useDispatch } from 'react-redux'
import { addItems } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import room from '../assets/images/hotel.jpg'
import Bills from '../components/menu/Bills';
import { TbSelect } from "react-icons/tb";
import { IoIosPersonAdd } from "react-icons/io";
import CustomerAdd from '../components/customers/CustomerAddModal';
import { api } from '../https';

const Menu = () => {
    // ✅ FIX: Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, []);
    
    const [formData, setFormData] = useState({
        bookingDate: '',
        returnDate: '',
        dayCount: '0'
    });

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'bookingDate' && formData.returnDate) {
            calculateDaysDifference(value, formData.returnDate);
        } else if (name === 'returnDate' && formData.bookingDate) {
            calculateDaysDifference(formData.bookingDate, value);
        }
    };

    const calculateDaysDifference = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff >= 0) {
            setFormData(prev => ({
                ...prev,
                dayCount: daysDiff.toString()
            }));
            setDayCount(daysDiff);
        } else {
            setFormData(prev => ({
                ...prev,
                dayCount: '0'
            }));
            setDayCount(0);
        }
    };

    const dispatch = useDispatch();
    const customerData = useSelector(state => state.customer);
    const roomData = useSelector(state => state.room);
    
    const cstButton = [{ label: 'Select Customer', action: 'customer' }]
    const [isSelectCustomer, setIsSelectCustomer] = useState(false);
    const [dayCount, setDayCount] = useState(0);
    const [itemId, setItemId] = useState();

    const handleSelectCustomer = (action) => {
        if (action === 'customer') setIsSelectCustomer(true)
    };

    // Add new customer modal
    // fetch customers
    const [list, setList] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1
    });

    const fetchCustomers = async (search = '') => {
        try {
            const response = await api.post('/api/customers/fetch',
                {
                    search,
                    sort,
                    page: pagination.currentPage,
                    limit: pagination.itemsPerPage
                }
            );

            if (response.data.success) {
                setList(response.data.customers || response.data.data || []);
                if (response.data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        currentPage: response.data.pagination.currentPage ?? prev.currentPage,
                        itemsPerPage: response.data.pagination.limit ?? prev.itemsPerPage,
                        totalItems: response.data.pagination.total ?? prev.totalItems,
                        totalPages: response.data.pagination.totalPages ?? prev.totalPages
                    }));
                };

            } else {
                toast.error(response.data.message || 'Empty customers list')
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            fetchCustomers();
        }
    }, [search, sort, pagination.currentPage, pagination.itemsPerPage]);

    // search - sorting - Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search, sort]);

    const [isAddCustomerModal, setIsAddCustomerModal] = useState(false);
    const handleOpenModal = (action) => {
        if (action === 'customer') setIsAddCustomerModal(true)
    };
    
    // In Menu component, update the helper functions:
    const hasCompany = () => {
        return customerData.companies === true;
    };

    const isPersonal = () => {
        return customerData.personal === true;
    };

    const getCompanyName = () => {
        return customerData.company || 'N/A';
    };

    // Get company balance for corporate customers
    const getCompanyBalance = () => {
        return customerData.companyBalance || 0;
    };

    // Get display balance (personal balance for individual, company balance for corporate)
    const getDisplayBalance = () => {
        if (hasCompany()) {
            return getCompanyBalance();  // This now returns customerData.companyBalance
        }
        return customerData.balance || 0;
    };

    // Get balance label
    const getBalanceLabel = () => {
        if (hasCompany()) {
            return "Company Balance:";
        }
        return "Balance:";
    };
   
    const handleAddToCard = (item) => {
        if (dayCount === 0) {
            toast.warning('Please specify booking dates!');
            return;
        };
        if (!roomData.roomNo) {
            toast.warning('Please select room first!');
            return;
        };

        // Check if a price was selected
        const selectedPrice = roomData.selectedPrice || roomData.priceOne;
        const selectedPriceType = roomData.selectedPriceType || 'priceOne';

        if (!selectedPrice) {
            toast.warning('Please select a price option for the room!');
            return;
        }

        if (dayCount < 50) {
            const id = roomData._id;
            const name = roomData.roomNo;
            const pricePerQuantity = selectedPrice;
            const seats = roomData.seats;
            const dateBooking = formData.bookingDate;
            const dateReturn = formData.returnDate;

            const newObj = {
                id: id,
                name,
                pricePerQuantity,
                quantity: dayCount,
                qty: dayCount,
                price: pricePerQuantity * dayCount,
                dateBooking,
                dateReturn,
                bookingDays: dayCount,
                seats: seats,
                priceType: selectedPriceType,
                floor: roomData.floor,
                image: roomData.image
            };

            dispatch(addItems(newObj));
            setDayCount(0);
            setFormData({ bookingDate: '', returnDate: '', dayCount: '0' });

            toast.success(`Room ${name} added to booking`);
        }
    };

    const roomNo = roomData.roomNo;
    const id = roomData._id;
    const name = roomData.name;
    const price = roomData.price;
    const seats = roomData.seats;
    const floor = roomData.floor;

    return (
        <section className="min-h-screen bg-gradient-to-br from-emerald-50 to-white p-2 md:p-2 lg:p-2">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl mb-2 md:mb-2 p-4 md:p-2">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <BackButton />
                            <div>
                                <h1 className="text-xl md:text-sm font-bold text-emerald-800 tracking-tight">
                                    Booking Invoice
                                </h1>
                            </div>
                        </div>

                        {/* Customer Info Section */}
                        <div className="w-full space-y-3">
                            {/* Regular Customer Info (for personal customers) */}
                            {!hasCompany() && customerData.customerName && (
                                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100 rounded-xl p-2 w-full">
                                    <div className="flex items-center justify-between gap-3">
                                        {/* Icon and buttons */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <FaCircleUser className="h-5 w-5 text-emerald-600" />
                                            <button
                                                onClick={() => handleSelectCustomer('customer')}
                                                className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors group"
                                                title="Select Customer"
                                            >
                                                <span className="text-xs font-medium">Select</span>
                                                <TbSelect className="transform group-hover:translate-x-1 transition-transform" size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal('customer')}
                                                className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
                                                title="Add New Customer"
                                            >
                                                <IoIosPersonAdd size={20} />
                                            </button>
                                        </div>

                                        {/* Guest Name */}
                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">Name:</span>
                                            <span className="text-sm font-semibold text-emerald-800 truncate">
                                                {customerData.customerName || 'Not Selected'}
                                            </span>
                                        </div>

                                        {/* ID Number */}
                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">ID:</span>
                                            <span className="text-sm font-medium text-gray-700">
                                                {customerData.Idnumber || '-----'}
                                            </span>
                                        </div>

                                        {/* Balance for personal customer */}
                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">{getBalanceLabel()}</span>
                                            <span className={`text-sm font-bold ${getDisplayBalance() === 0 || !getDisplayBalance() ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {(Number(getDisplayBalance()) || 0).toFixed(2)} SD
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Corporate Customer Info (for customers with company) */}
                            {hasCompany() && customerData.customerName && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-2 w-full">
                                    <div className="flex items-center justify-between gap-3">
                                        {/* Icon and buttons */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <FaCircleUser className="h-5 w-5 text-blue-600" />
                                            <button
                                                onClick={() => handleSelectCustomer('customer')}
                                                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors group"
                                                title="Select Customer"
                                            >
                                                <span className="text-xs font-medium">Select</span>
                                                <TbSelect className="transform group-hover:translate-x-1 transition-transform" size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal('customer')}
                                                className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                                title="Add New Customer"
                                            >
                                                <IoIosPersonAdd size={20} />
                                            </button>
                                        </div>

                                        {/* Guest Name */}
                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">Name:</span>
                                            <span className="text-sm font-semibold text-blue-800 truncate">
                                                {customerData.customerName || 'Not Selected'}
                                            </span>
                                        </div>

                                        {/* ID Number */}
                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">ID:</span>
                                            <span className="text-sm font-medium text-gray-700">
                                                {customerData.Idnumber || '-----'}
                                            </span>
                                        </div>

                                        {/* Company Name */}
                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                            <span className="text-xs text-gray-500 whitespace-nowrap">Company:</span>
                                            <span className="text-sm font-semibold text-blue-800 truncate">
                                                {getCompanyName()}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Additional Corporate Info Row - Display Company Balance */}
                                    <div className="mt-3 pt-3 border-t border-blue-200">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 whitespace-nowrap">Customer Type:</span>
                                                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                    Corporate Customer
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 whitespace-nowrap">Company Balance:</span>
                                                <span className={`text-sm font-bold ${getDisplayBalance() === 0 || !getDisplayBalance() ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {(Number(getDisplayBalance()) || 0).toFixed(2)} SD
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Show select buttons when no customer selected */}
                            {!customerData.customerName && (
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-3 w-full">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleSelectCustomer('customer')}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                        >
                                            <TbSelect size={18} />
                                            <span className="text-sm font-medium">Select Customer</span>
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal('customer')}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                        >
                                            <IoIosPersonAdd size={18} />
                                            <span className="text-sm font-medium">Add New Customer</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        No customer selected. Please select or add a customer to continue.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                    {/* Left Section - Room Details */}
                    <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Room Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-2 md:p-2 text-white">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold">{roomData.roomNo || 'Select a Room'}</h2>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-emerald-700/30 backdrop-blur-sm rounded-full text-sm font-medium">
                                        Floor {roomData.floor || '--'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Room Image */}
                        <div className="p-2 md:p-1">
                            <div className="relative overflow-hidden rounded-xl border-2 border-emerald-100">
                                <img
                                    src={roomData.image || room}
                                    alt="Room"
                                    className="w-full h-48 md:h-45 object-cover transform hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-900/70 to-transparent p-4">
                                    <p className="text-white text-sm font-medium">Premium Room</p>
                                </div>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="px-2 md:px-6 pb-1">
                            <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100">
                                <div className="text-center mb-1">
                                    <p className="text-sm text-emerald-700 font-medium">
                                        {roomData.selectedPriceType === 'priceTow' ? 'Premium Rate' : 'Standard Rate'}
                                    </p>
                                    <div className="flex items-center justify-center gap-3 mt-1">
                                        <span className="text-xl md:text-3xl font-bold text-emerald-800">
                                            {roomData.selectedPrice ? roomData.selectedPrice.toFixed(2) :
                                                roomData.priceOne ? roomData.priceOne.toFixed(2) : '0.00'}
                                        </span>
                                        <span className="text-lg text-emerald-600 font-medium">SD / night</span>
                                    </div>
                                    {roomData.selectedPriceType && (
                                        <div className="mt-1 text-xs text-emerald-600">
                                            ({roomData.selectedPriceType === 'priceTow' ? 'Price Option 2' : 'Price Option 1'})
                                        </div>
                                    )}
                                </div>

                                {/* Show both price options if available */}
                                {roomData.priceOne && roomData.priceTow && !roomData.selectedPrice && (
                                    <div className="mt-4 pt-4 border-t border-emerald-200">
                                        <p className="text-xs text-emerald-600 text-center mb-2">
                                            Select price option in room card
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking Dates Section */}
                        <div className="p-4 md:p-6 border-t border-emerald-100">
                            <h3 className="text-lg font-bold text-emerald-800 mb-4">Select Booking Period</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-emerald-700">
                                        From Date
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="bookingDate"
                                            value={formData.bookingDate}
                                            onChange={handleDateChange}
                                            className="w-full p-3 bg-white border-2 border-emerald-200 rounded-lg text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-emerald-700">
                                        To Date
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="returnDate"
                                            value={formData.returnDate}
                                            onChange={handleDateChange}
                                            className="w-full p-3 bg-white border-2 border-emerald-200 rounded-lg text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-emerald-700">
                                        Total Nights
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="dayCount"
                                            value={formData.dayCount}
                                            readOnly
                                            className="w-full p-3 bg-emerald-50 border-2 border-emerald-300 rounded-lg text-emerald-800 font-bold text-center text-xl"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <span className="text-sm text-emerald-600 font-medium">nights</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => handleAddToCard({ id, name, seats, price, floor })}
                                    disabled={!roomData.roomNo || dayCount === 0 || !customerData.customerName}
                                    className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                                >
                                    <HiMiniKey className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                    <span className="text-lg">
                                        {!roomData.roomNo ? 'Select Room First' : !customerData.customerName ? 'Select Customer First' : dayCount === 0 ? 'Select Dates' : 'Add to Booking'}
                                    </span>
                                    <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                                </button>
                            </div>

                            {/* Booking Summary */}
                            {dayCount > 0 && roomData.price && (
                                <div className="mt-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                                    <h4 className="font-bold text-emerald-800 mb-2">Booking Summary</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-emerald-600">Rate per night</p>
                                            <p className="font-bold text-emerald-800">{roomData.price.toFixed(2)} SD</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-emerald-600">Total nights</p>
                                            <p className="font-bold text-emerald-800">{dayCount} nights</p>
                                        </div>
                                        <div className="col-span-2 pt-3 border-t border-emerald-200">
                                            <div className="flex justify-between items-center">
                                                <p className="text-lg font-bold text-emerald-800">Total Amount</p>
                                                <p className="text-2xl font-bold text-emerald-800">
                                                    {(roomData.price * dayCount).toFixed(2)} SD
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Customer, Cart, Bill */}
                    <div className="w-full lg:w-96 flex flex-col gap-4 md:gap-6">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <Bills />
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <CartInfo />
                        </div>
                    </div>
                </div>
            </div>

            {/* Select Customer Modal */}
            {isSelectCustomer && (
                <SelectCustomer setIsSelectCustomer={setIsSelectCustomer} />
            )}

            {/* Add Customer Modal */}
            {isAddCustomerModal &&
                <CustomerAdd
                    setIsAddCustomerModal={setIsAddCustomerModal}
                    fetchCustomers={fetchCustomers}
                />
            }
        </section>
    );
};

export default Menu;

// import React, { useState, useRef, useEffect } from 'react'
// import CustomerInfo from '../components/menu/CustomerInfo';
// import CartInfo from '../components/menu/CartInfo';
// import SelectCustomer from '../components/menu/SelectCustomer';
// import BackButton from '../components/shared/BackButton';
// import { HiMiniKey } from "react-icons/hi2";
// import { IoMdArrowDropright } from "react-icons/io";
// import { FaCircleUser } from "react-icons/fa6";
// import { useSelector, useDispatch } from 'react-redux'
// import { addItems } from '../redux/slices/cartSlice';
// import { toast } from 'react-toastify';
// import room from '../assets/images/hotel.jpg'
// import Bill from '../components/menu/Bills';
// import { TbSelect } from "react-icons/tb";
// import { IoIosPersonAdd } from "react-icons/io";
// import CustomerAdd from '../components/customers/CustomerAddModal';
// import { api } from '../https';

// const Menu = () => {
//     // ✅ FIX: Scroll to top when component mounts
//     useEffect(() => {
//         window.scrollTo({
//             top: 0,
//             left: 0,
//             behavior: 'instant'
//         });
//     }, []);
    
//     const [formData, setFormData] = useState({
//         bookingDate: '',
//         returnDate: '',
//         dayCount: '0'
//     });

//     const handleDateChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));

//         if (name === 'bookingDate' && formData.returnDate) {
//             calculateDaysDifference(value, formData.returnDate);
//         } else if (name === 'returnDate' && formData.bookingDate) {
//             calculateDaysDifference(formData.bookingDate, value);
//         }
//     };

//     const calculateDaysDifference = (startDate, endDate) => {
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         const timeDiff = end.getTime() - start.getTime();
//         const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

//         if (daysDiff >= 0) {
//             setFormData(prev => ({
//                 ...prev,
//                 dayCount: daysDiff.toString()
//             }));
//             setDayCount(daysDiff);
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 dayCount: '0'
//             }));
//             setDayCount(0);
//         }
//     };

//     const dispatch = useDispatch();
//     const customerData = useSelector(state => state.customer);
//     const roomData = useSelector(state => state.room);
    
//     const cstButton = [{ label: 'Select Customer', action: 'customer' }]
//     const [isSelectCustomer, setIsSelectCustomer] = useState(false);
//     const [dayCount, setDayCount] = useState(0);
//     const [itemId, setItemId] = useState();

//     const handleSelectCustomer = (action) => {
//         if (action === 'customer') setIsSelectCustomer(true)
//     };

//     // Add new customer modal
//     // fetch customers
//     const [list, setList] = useState([]);
//     const [search, setSearch] = useState('');
//     const [sort, setSort] = useState('-createdAt');
//     const [pagination, setPagination] = useState({
//         currentPage: 1,
//         itemsPerPage: 10,
//         totalItems: 0,
//         totalPages: 1
//     });

//     const fetchCustomers = async (search = '') => {
//         try {
//             const response = await api.post('/api/customers/fetch',
//                 {
//                     search,
//                     sort,
//                     page: pagination.currentPage,
//                     limit: pagination.itemsPerPage
//                 }
//             );

//             if (response.data.success) {
//                 setList(response.data.customers || response.data.data || []);
//                 if (response.data.pagination) {
//                     setPagination(prev => ({
//                         ...prev,
//                         currentPage: response.data.pagination.currentPage ?? prev.currentPage,
//                         itemsPerPage: response.data.pagination.limit ?? prev.itemsPerPage,
//                         totalItems: response.data.pagination.total ?? prev.totalItems,
//                         totalPages: response.data.pagination.totalPages ?? prev.totalPages
//                     }));
//                 };

//             } else {
//                 toast.error(response.data.message || 'Empty customers list')
//             }

//         } catch (error) {
//             console.log(error)
//             toast.error(error.message)
//         }
//     }

//     const isInitialMount = useRef(true);
//     useEffect(() => {
//         if (isInitialMount.current) {
//             isInitialMount.current = false;
//         } else {
//             fetchCustomers();
//         }
//     }, [search, sort, pagination.currentPage, pagination.itemsPerPage]);

//     // search - sorting - Debounce search to avoid too many API calls
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             fetchCustomers(search);
//         }, 500);

//         return () => clearTimeout(timer);
//     }, [search, sort]);

//     const [isAddCustomerModal, setIsAddCustomerModal] = useState(false);
//     const handleOpenModal = (action) => {
//         if (action === 'customer') setIsAddCustomerModal(true)
//     };
    
//     // Updated helper functions to work with the Redux slice
//     const hasCompany = () => {
//         return customerData.companies === true;
//     };

//     const isPersonal = () => {
//         return customerData.personal === true;
//     };

//     const getCompanyName = () => {
//         return customerData.company || 'N/A';
//     };
   
//     const handleAddToCard = (item) => {
//         if (dayCount === 0) {
//             toast.warning('Please specify booking dates!');
//             return;
//         };
//         if (!roomData.roomNo) {
//             toast.warning('Please select room first!');
//             return;
//         };

//         // Check if a price was selected
//         const selectedPrice = roomData.selectedPrice || roomData.priceOne;
//         const selectedPriceType = roomData.selectedPriceType || 'priceOne';

//         if (!selectedPrice) {
//             toast.warning('Please select a price option for the room!');
//             return;
//         }

//         if (dayCount < 50) {
//             const id = roomData._id;
//             const name = roomData.roomNo;
//             const pricePerQuantity = selectedPrice;
//             const seats = roomData.seats;
//             const dateBooking = formData.bookingDate;
//             const dateReturn = formData.returnDate;

//             const newObj = {
//                 id: id,
//                 name,
//                 pricePerQuantity,
//                 quantity: dayCount,
//                 qty: dayCount,
//                 price: pricePerQuantity * dayCount,
//                 dateBooking,
//                 dateReturn,
//                 bookingDays: dayCount,
//                 seats: seats,
//                 priceType: selectedPriceType,
//                 floor: roomData.floor,
//                 image: roomData.image
//             };

//             dispatch(addItems(newObj));
//             setDayCount(0);
//             setFormData({ bookingDate: '', returnDate: '', dayCount: '0' });

//             toast.success(`Room ${name} added to booking`);
//         }
//     };

//     const roomNo = roomData.roomNo;
//     const id = roomData._id;
//     const name = roomData.name;
//     const price = roomData.price;
//     const seats = roomData.seats;
//     const floor = roomData.floor;

//     return (
//         <section className="min-h-screen bg-gradient-to-br from-emerald-50 to-white p-2 md:p-2 lg:p-2">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header Section */}
//                 <div className="bg-white rounded-2xl shadow-xl mb-2 md:mb-2 p-4 md:p-2">
//                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//                         <div className="flex items-center gap-3">
//                             <BackButton />
//                             <div>
//                                 <h1 className="text-xl md:text-sm font-bold text-emerald-800 tracking-tight">
//                                     Booking Invoice
//                                 </h1>
//                             </div>
//                         </div>

//                         {/* Customer Info Section */}
//                         <div className="w-full space-y-3">
//                             {/* Regular Customer Info (for personal customers) */}
//                             {!hasCompany() && customerData.customerName && (
//                                 <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100 rounded-xl p-2 w-full">
//                                     <div className="flex items-center justify-between gap-3">
//                                         {/* Icon and buttons */}
//                                         <div className="flex items-center gap-1 flex-shrink-0">
//                                             <FaCircleUser className="h-5 w-5 text-emerald-600" />
//                                             <button
//                                                 onClick={() => handleSelectCustomer('customer')}
//                                                 className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors group"
//                                                 title="Select Customer"
//                                             >
//                                                 <span className="text-xs font-medium">Select</span>
//                                                 <TbSelect className="transform group-hover:translate-x-1 transition-transform" size={16} />
//                                             </button>
//                                             <button
//                                                 onClick={() => handleOpenModal('customer')}
//                                                 className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
//                                                 title="Add New Customer"
//                                             >
//                                                 <IoIosPersonAdd size={20} />
//                                             </button>
//                                         </div>

//                                         {/* Guest Name */}
//                                         <div className="flex items-center gap-1 flex-1 min-w-0">
//                                             <span className="text-xs text-gray-500 whitespace-nowrap">Name:</span>
//                                             <span className="text-sm font-semibold text-emerald-800 truncate">
//                                                 {customerData.customerName || 'Not Selected'}
//                                             </span>
//                                         </div>

//                                         {/* ID Number */}
//                                         <div className="flex items-center gap-1 flex-1 min-w-0">
//                                             <span className="text-xs text-gray-500 whitespace-nowrap">ID:</span>
//                                             <span className="text-sm font-medium text-gray-700">
//                                                 {customerData.Idnumber || '-----'}
//                                             </span>
//                                         </div>

//                                         {/* Balance */}
//                                         <div className="flex items-center gap-1 flex-1 min-w-0">
//                                             <span className="text-xs text-gray-500 whitespace-nowrap">Balance:</span>
//                                             <span className={`text-sm font-bold ${customerData.balance === 0 || !customerData.balance ? 'text-emerald-600' : 'text-red-600'}`}>
//                                                 {(Number(customerData.balance) || 0).toFixed(2)} SD
//                                             </span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Corporate Customer Info (for customers with company) */}
//                             {hasCompany() && customerData.customerName && (
//                                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-2 w-full">
//                                     <div className="flex items-center justify-between gap-3">
//                                         {/* Icon and buttons */}
//                                         <div className="flex items-center gap-1 flex-shrink-0">
//                                             <FaCircleUser className="h-5 w-5 text-blue-600" />
//                                             <button
//                                                 onClick={() => handleSelectCustomer('customer')}
//                                                 className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors group"
//                                                 title="Select Customer"
//                                             >
//                                                 <span className="text-xs font-medium">Select</span>
//                                                 <TbSelect className="transform group-hover:translate-x-1 transition-transform" size={16} />
//                                             </button>
//                                             <button
//                                                 onClick={() => handleOpenModal('customer')}
//                                                 className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
//                                                 title="Add New Customer"
//                                             >
//                                                 <IoIosPersonAdd size={20} />
//                                             </button>
//                                         </div>

//                                         {/* Guest Name */}
//                                         <div className="flex items-center gap-1 flex-1 min-w-0">
//                                             <span className="text-xs text-gray-500 whitespace-nowrap">Name:</span>
//                                             <span className="text-sm font-semibold text-blue-800 truncate">
//                                                 {customerData.customerName || 'Not Selected'}
//                                             </span>
//                                         </div>

//                                         {/* ID Number */}
//                                         <div className="flex items-center gap-1 flex-1 min-w-0">
//                                             <span className="text-xs text-gray-500 whitespace-nowrap">ID:</span>
//                                             <span className="text-sm font-medium text-gray-700">
//                                                 {customerData.Idnumber || '-----'}
//                                             </span>
//                                         </div>

//                                         {/* Company Name */}
//                                         <div className="flex items-center gap-1 flex-1 min-w-0">
//                                             <span className="text-xs text-gray-500 whitespace-nowrap">Company:</span>
//                                             <span className="text-sm font-semibold text-blue-800 truncate">
//                                                 {getCompanyName()}
//                                             </span>
//                                         </div>
//                                     </div>
                                    
//                                     {/* Additional Corporate Info Row */}
//                                     <div className="mt-3 pt-3 border-t border-blue-200">
//                                         <div className="grid grid-cols-2 gap-3">
//                                             <div className="flex items-center gap-2">
//                                                 <span className="text-xs text-gray-500 whitespace-nowrap">Customer Type:</span>
//                                                 <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
//                                                     Corporate Customer
//                                                 </span>
//                                             </div>
//                                             <div className="flex items-center gap-2">
//                                                 <span className="text-xs text-gray-500 whitespace-nowrap">Balance:</span>
//                                                 <span className="text-xs text-gray-400 italic">Not applicable</span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Show select buttons when no customer selected */}
//                             {!customerData.customerName && (
//                                 <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-3 w-full">
//                                     <div className="flex items-center justify-center gap-3">
//                                         <button
//                                             onClick={() => handleSelectCustomer('customer')}
//                                             className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
//                                         >
//                                             <TbSelect size={18} />
//                                             <span className="text-sm font-medium">Select Customer</span>
//                                         </button>
//                                         <button
//                                             onClick={() => handleOpenModal('customer')}
//                                             className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
//                                         >
//                                             <IoIosPersonAdd size={18} />
//                                             <span className="text-sm font-medium">Add New Customer</span>
//                                         </button>
//                                     </div>
//                                     <p className="text-xs text-gray-500 text-center mt-2">
//                                         No customer selected. Please select or add a customer to continue.
//                                     </p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
//                     {/* Left Section - Room Details */}
//                     <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
//                         {/* Room Header */}
//                         <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-2 md:p-2 text-white">
//                             <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
//                                 <div>
//                                     <h2 className="text-xl md:text-2xl font-bold">{roomData.roomNo || 'Select a Room'}</h2>
//                                 </div>
//                                 <div className="flex gap-2">
//                                     <span className="px-3 py-1 bg-emerald-700/30 backdrop-blur-sm rounded-full text-sm font-medium">
//                                         Floor {roomData.floor || '--'}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Room Image */}
//                         <div className="p-2 md:p-1">
//                             <div className="relative overflow-hidden rounded-xl border-2 border-emerald-100">
//                                 <img
//                                     src={roomData.image || room}
//                                     alt="Room"
//                                     className="w-full h-48 md:h-45 object-cover transform hover:scale-105 transition-transform duration-500"
//                                 />
//                                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-900/70 to-transparent p-4">
//                                     <p className="text-white text-sm font-medium">Premium Room</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Price Section */}
//                         <div className="px-2 md:px-6 pb-1">
//                             <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100">
//                                 <div className="text-center mb-1">
//                                     <p className="text-sm text-emerald-700 font-medium">
//                                         {roomData.selectedPriceType === 'priceTow' ? 'Premium Rate' : 'Standard Rate'}
//                                     </p>
//                                     <div className="flex items-center justify-center gap-3 mt-1">
//                                         <span className="text-xl md:text-3xl font-bold text-emerald-800">
//                                             {roomData.selectedPrice ? roomData.selectedPrice.toFixed(2) :
//                                                 roomData.priceOne ? roomData.priceOne.toFixed(2) : '0.00'}
//                                         </span>
//                                         <span className="text-lg text-emerald-600 font-medium">SD / night</span>
//                                     </div>
//                                     {roomData.selectedPriceType && (
//                                         <div className="mt-1 text-xs text-emerald-600">
//                                             ({roomData.selectedPriceType === 'priceTow' ? 'Price Option 2' : 'Price Option 1'})
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Show both price options if available */}
//                                 {roomData.priceOne && roomData.priceTow && !roomData.selectedPrice && (
//                                     <div className="mt-4 pt-4 border-t border-emerald-200">
//                                         <p className="text-xs text-emerald-600 text-center mb-2">
//                                             Select price option in room card
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Booking Dates Section */}
//                         <div className="p-4 md:p-6 border-t border-emerald-100">
//                             <h3 className="text-lg font-bold text-emerald-800 mb-4">Select Booking Period</h3>
                            
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-emerald-700">
//                                         From Date
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="date"
//                                             name="bookingDate"
//                                             value={formData.bookingDate}
//                                             onChange={handleDateChange}
//                                             className="w-full p-3 bg-white border-2 border-emerald-200 rounded-lg text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-emerald-700">
//                                         To Date
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="date"
//                                             name="returnDate"
//                                             value={formData.returnDate}
//                                             onChange={handleDateChange}
//                                             className="w-full p-3 bg-white border-2 border-emerald-200 rounded-lg text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-emerald-700">
//                                         Total Nights
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="text"
//                                             name="dayCount"
//                                             value={formData.dayCount}
//                                             readOnly
//                                             className="w-full p-3 bg-emerald-50 border-2 border-emerald-300 rounded-lg text-emerald-800 font-bold text-center text-xl"
//                                         />
//                                         <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                                             <span className="text-sm text-emerald-600 font-medium">nights</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Add to Cart Button */}
//                             <div className="flex justify-center">
//                                 <button
//                                     onClick={() => handleAddToCard({ id, name, seats, price, floor })}
//                                     disabled={!roomData.roomNo || dayCount === 0 || !customerData.customerName}
//                                     className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
//                                 >
//                                     <HiMiniKey className="h-6 w-6 group-hover:rotate-12 transition-transform" />
//                                     <span className="text-lg">
//                                         {!roomData.roomNo ? 'Select Room First' : !customerData.customerName ? 'Select Customer First' : dayCount === 0 ? 'Select Dates' : 'Add to Booking'}
//                                     </span>
//                                     <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
//                                 </button>
//                             </div>

//                             {/* Booking Summary */}
//                             {dayCount > 0 && roomData.price && (
//                                 <div className="mt-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
//                                     <h4 className="font-bold text-emerald-800 mb-2">Booking Summary</h4>
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div>
//                                             <p className="text-sm text-emerald-600">Rate per night</p>
//                                             <p className="font-bold text-emerald-800">{roomData.price.toFixed(2)} SD</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-sm text-emerald-600">Total nights</p>
//                                             <p className="font-bold text-emerald-800">{dayCount} nights</p>
//                                         </div>
//                                         <div className="col-span-2 pt-3 border-t border-emerald-200">
//                                             <div className="flex justify-between items-center">
//                                                 <p className="text-lg font-bold text-emerald-800">Total Amount</p>
//                                                 <p className="text-2xl font-bold text-emerald-800">
//                                                     {(roomData.price * dayCount).toFixed(2)} SD
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Right Section - Customer, Cart, Bill */}
//                     <div className="w-full lg:w-96 flex flex-col gap-4 md:gap-6">
//                         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//                             <Bill />
//                         </div>
//                         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//                             <CartInfo />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Select Customer Modal */}
//             {isSelectCustomer && (
//                 <SelectCustomer setIsSelectCustomer={setIsSelectCustomer} />
//             )}

//             {/* Add Customer Modal */}
//             {isAddCustomerModal &&
//                 <CustomerAdd
//                     setIsAddCustomerModal={setIsAddCustomerModal}
//                     fetchCustomers={fetchCustomers}
//                 />
//             }
//         </section>
//     );
// };

// export default Menu;


// import React, { useState, useRef, useEffect } from 'react'
// import CustomerInfo from '../components/menu/CustomerInfo';
// import CartInfo from '../components/menu/CartInfo';
// import SelectCustomer from '../components/menu/SelectCustomer';
// import BackButton from '../components/shared/BackButton';
// import { HiMiniKey } from "react-icons/hi2";
// import { IoMdArrowDropright } from "react-icons/io";
// import { FaCircleUser } from "react-icons/fa6";
// import { useSelector, useDispatch } from 'react-redux'
// import { addItems } from '../redux/slices/cartSlice';
// import { toast } from 'react-toastify';
// import room from '../assets/images/hotel.jpg'
// import Bill from '../components/menu/Bills';
// import { TbSelect } from "react-icons/tb";
// import { IoIosPersonAdd } from "react-icons/io";
// import CustomerAdd from '../components/customers/CustomerAddModal';
// import { api } from '../https';

// const Menu = () => {
//     // ✅ FIX: Scroll to top when component mounts
//     useEffect(() => {
//         window.scrollTo({
//             top: 0,
//             left: 0,
//             behavior: 'instant' // Use 'smooth' for smooth scrolling, 'instant' for immediate
//         });
//     }, []);
    
//     const [formData, setFormData] = useState({
//         bookingDate: '',
//         returnDate: '',
//         dayCount: '0'
//     });

//     const handleDateChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));

//         if (name === 'bookingDate' && formData.returnDate) {
//             calculateDaysDifference(value, formData.returnDate);
//         } else if (name === 'returnDate' && formData.bookingDate) {
//             calculateDaysDifference(formData.bookingDate, value);
//         }
//     };

//     const calculateDaysDifference = (startDate, endDate) => {
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         const timeDiff = end.getTime() - start.getTime();
//         const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

//         if (daysDiff >= 0) {
//             setFormData(prev => ({
//                 ...prev,
//                 dayCount: daysDiff.toString()
//             }));
//             setDayCount(daysDiff);
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 dayCount: '0'
//             }));
//             setDayCount(0);
//         }
//     };

//     const dispatch = useDispatch();
//     const customerData = useSelector(state => state.customer);
//     const roomData = useSelector(state => state.room);
    
//     const cstButton = [{ label: 'Select Customer', action: 'customer' }]
//     const [isSelectCustomer, setIsSelectCustomer] = useState(false);
//     const [dayCount, setDayCount] = useState(0);
//     const [itemId, setItemId] = useState();

//     const handleSelectCustomer = (action) => {
//         if (action === 'customer') setIsSelectCustomer(true)
//     };

//     // Add new customer modal
//     // fetch customers
//         const [list, setList] = useState([]);
//         const [search, setSearch] = useState('');
//         const [sort, setSort] = useState('-createdAt');
//         const [pagination, setPagination] = useState({
//             currentPage: 1,
//             itemsPerPage: 10,
//             totalItems: 0,
//             totalPages: 1
//         });
    
    
//         const fetchCustomers = async (search = '') => {
//             try {
//                 const response = await api.post('/api/customers/fetch',
//                     {
//                         search,
//                         sort,
//                         page: pagination.currentPage,
//                         limit: pagination.itemsPerPage
//                     }
//                 );
    
//                 if (response.data.success) {
//                     setList(response.data.customers || response.data.data || []);
//                     if (response.data.pagination) {
//                         setPagination(prev => ({
//                             ...prev,  // Keep existing values
//                             currentPage: response.data.pagination.currentPage ?? prev.currentPage,
//                             itemsPerPage: response.data.pagination.limit ?? prev.itemsPerPage,
//                             totalItems: response.data.pagination.total ?? prev.totalItems,
//                             totalPages: response.data.pagination.totalPages ?? prev.totalPages
//                         }));
//                     };
    
//                 } else {
//                     toast.error(response.data.message || 'Empty customers list')
//                 }
    
//             } catch (error) {
//                 console.log(error)
//                 toast.error(error.message)
//             }
//         }
    
//         const isInitialMount = useRef(true);
//         useEffect(() => {
//             if (isInitialMount.current) {
//                 isInitialMount.current = false;
//             } else {
//                 fetchCustomers();
//             }
//         }, [search, sort, pagination.currentPage, pagination.itemsPerPage]);
    
//         // search - sorting - Debounce search to avoid too many API calls
//         useEffect(() => {
//             const timer = setTimeout(() => {
//                 fetchCustomers(search);
//             }, 500); // 500ms delay
    
//             return () => clearTimeout(timer);
//         }, [search, sort]);

//     const [isAddCustomerModal, setIsAddCustomerModal] = useState(false);
//         const handleOpenModal = (action) => {
//             if (action === 'customer') setIsAddCustomerModal(true)
//         };
    
   
//     const handleAddToCard = (item) => {
//         if (dayCount === 0) {
//             toast.warning('Please specify booking dates!');
//             return;
//         };
//         if (!roomData.roomNo) {
//             toast.warning('Please select room first!');
//             return;
//         };

//         // Check if a price was selected
//         const selectedPrice = roomData.selectedPrice || roomData.priceOne;
//         const selectedPriceType = roomData.selectedPriceType || 'priceOne';

//         if (!selectedPrice) {
//             toast.warning('Please select a price option for the room!');
//             return;
//         }

//         if (dayCount < 50) {
//             const id = roomData._id;
//             const name = roomData.roomNo;
//             const pricePerQuantity = selectedPrice;
//             const seats = roomData.seats;
//             const dateBooking = formData.bookingDate;
//             const dateReturn = formData.returnDate;

//             const newObj = {
//                 id: id,
//                 name,
//                 pricePerQuantity,
//                 quantity: dayCount,
//                 qty: dayCount,
//                 price: pricePerQuantity * dayCount,
//                 dateBooking,
//                 dateReturn,
//                 bookingDays: dayCount,
//                 seats: seats,
//                 priceType: selectedPriceType, // Add priceType to identify which price was selected
//                 floor: roomData.floor,
//                 image: roomData.image
//             };

//             dispatch(addItems(newObj));
//             setDayCount(0);
//             setFormData({ bookingDate: '', returnDate: '', dayCount: '0' });

//             toast.success(`Room ${name} added to booking`);
//         }
//     };

//     const roomNo = roomData.roomNo;
//     const id = roomData._id;
//     const name = roomData.name;
//     const price = roomData.price; // Note: This should be selected price
//     const seats = roomData.seats;
//     const floor = roomData.floor;

//     return (
//         <section className="min-h-screen bg-gradient-to-br from-emerald-50 to-white p-2 md:p-2 lg:p-2">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header Section */}
//                 <div className="bg-white rounded-2xl shadow-xl mb-2 md:mb-2 p-4 md:p-2">
//                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//                         <div className="flex items-center gap-3">
//                             <BackButton />
//                             <div>
//                                 <h1 className="text-xl md:text-sm font-bold text-emerald-800 tracking-tight">
//                                     Booking Invoice
//                                 </h1>
//                                 {/* <p className="text-sm text-emerald-600 mt-1">Manage bookings efficiently</p> */}
//                             </div>
//                         </div>

//                         {/* Customer Info Section */}
//                         <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100 rounded-xl p-2 w-full">
//                             <div className="flex items-center justify-between gap-3">
//                                 {/* Icon and buttons */}
//                                 <div className="flex items-center gap-1 flex-shrink-0">
//                                     <FaCircleUser className="h-5 w-5 text-emerald-600" />
//                                     <button
//                                         onClick={() => handleSelectCustomer('customer')}
//                                         className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors group"
//                                         title="Select Customer"
//                                     >
//                                         <span className="text-xs font-medium">Select</span>
//                                         <TbSelect className="transform group-hover:translate-x-1 transition-transform" size={16} />
//                                     </button>
//                                     <button
//                                         onClick={() => handleOpenModal('customer')}
//                                         className="p-1 text-emerald-600 hover:text-emerald-700 transition-colors"
//                                         title="Add New Customer"
//                                     >
//                                         <IoIosPersonAdd size={20} />
//                                     </button>
//                                 </div>

//                                 {/* Guest Name */}
//                                 <div className="flex items-center gap-1 flex-1 min-w-0">
//                                     <span className="text-xs text-gray-500 whitespace-nowrap">Name:</span>
//                                     <span className="text-sm font-semibold text-emerald-800 truncate">
//                                         {customerData.customerName || 'Not Selected'}
//                                     </span>
//                                 </div>

//                                 {/* ID Number */}
//                                 <div className="flex items-center gap-1 flex-1 min-w-0">
//                                     <span className="text-xs text-gray-500 whitespace-nowrap">ID:</span>
//                                     <span className="text-sm font-medium text-gray-700">
//                                         {customerData.Idnumber || '-----'}
//                                     </span>
//                                 </div>

//                                 {/* Balance */}
//                                 <div className="flex items-center gap-1 flex-1 min-w-0">
//                                     <span className="text-xs text-gray-500 whitespace-nowrap">Balance:</span>
//                                     <span className={`text-sm font-bold ${customerData.balance === 0 || !customerData.balance ? 'text-emerald-600' : 'text-red-600'}`}>
//                                         {(Number(customerData.balance) || 0).toFixed(2)} SD
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>


//                     </div>
//                 </div>

//                 <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
//                     {/* Left Section - Room Details */}
//                     <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
//                         {/* Room Header */}
//                         <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-2 md:p-2 text-white">
//                             <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
//                                 <div>
//                                     <h2 className="text-xl md:text-2xl font-bold">{roomData.roomNo || 'Select a Room'}</h2>
//                                     {/* <p className="text-emerald-100 text-sm mt-1">Room Information</p> */}
//                                 </div>
//                                 <div className="flex gap-2">
//                                     <span className="px-3 py-1 bg-emerald-700/30 backdrop-blur-sm rounded-full text-sm font-medium">
//                                         Floor {roomData.floor || '--'}
//                                     </span>
                                    
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Room Image */}
//                         <div className="p-2 md:p-1">
//                             <div className="relative overflow-hidden rounded-xl border-2 border-emerald-100">
//                                 <img
//                                     src={roomData.image || room}
//                                     alt="Room"
//                                     className="w-full h-48 md:h-45 object-cover transform hover:scale-105 transition-transform duration-500"
//                                 />
//                                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-900/70 to-transparent p-4">
//                                     <p className="text-white text-sm font-medium">Premium Room</p>
//                                 </div>
//                             </div>
//                         </div>


//                         {/* Price Section */}
//                         <div className="px-2 md:px-6 pb-1">
//                             <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100">
//                                 <div className="text-center mb-1">
//                                     <p className="text-sm text-emerald-700 font-medium">
//                                         {roomData.selectedPriceType === 'priceTow' ? 'Premium Rate' : 'Standard Rate'}
//                                     </p>
//                                     <div className="flex items-center justify-center gap-3 mt-1">
//                                         <span className="text-xl md:text-3xl font-bold text-emerald-800">
//                                             {roomData.selectedPrice ? roomData.selectedPrice.toFixed(2) :
//                                                 roomData.priceOne ? roomData.priceOne.toFixed(2) : '0.00'}
//                                         </span>
//                                         <span className="text-lg text-emerald-600 font-medium">SD / night</span>
//                                     </div>
//                                     {roomData.selectedPriceType && (
//                                         <div className="mt-1 text-xs text-emerald-600">
//                                             ({roomData.selectedPriceType === 'priceTow' ? 'Price Option 2' : 'Price Option 1'})
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Show both price options if available */}
//                                 {roomData.priceOne && roomData.priceTow && !roomData.selectedPrice && (
//                                     <div className="mt-4 pt-4 border-t border-emerald-200">
//                                         <p className="text-xs text-emerald-600 text-center mb-2">
//                                             Select price option in room card
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Booking Dates Section */}
//                         <div className="p-4 md:p-6 border-t border-emerald-100">
//                             <h3 className="text-lg font-bold text-emerald-800 mb-4">Select Booking Period</h3>
                            
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-emerald-700">
//                                         From Date
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="date"
//                                             name="bookingDate"
//                                             value={formData.bookingDate}
//                                             onChange={handleDateChange}
//                                             className="w-full p-3 bg-white border-2 border-emerald-200 rounded-lg text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-emerald-700">
//                                         To Date
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="date"
//                                             name="returnDate"
//                                             value={formData.returnDate}
//                                             onChange={handleDateChange}
//                                             className="w-full p-3 bg-white border-2 border-emerald-200 rounded-lg text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="space-y-2">
//                                     <label className="block text-sm font-medium text-emerald-700">
//                                         Total Nights
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="text"
//                                             name="dayCount"
//                                             value={formData.dayCount}
//                                             readOnly
//                                             className="w-full p-3 bg-emerald-50 border-2 border-emerald-300 rounded-lg text-emerald-800 font-bold text-center text-xl"
//                                         />
//                                         <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                                             <span className="text-sm text-emerald-600 font-medium">nights</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Add to Cart Button */}
//                             <div className="flex justify-center">
//                                 <button
//                                     onClick={() => handleAddToCard({ id, name, seats, price, floor })}
//                                     disabled={!roomData.roomNo || dayCount === 0}
//                                     className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
//                                 >
//                                     <HiMiniKey className="h-6 w-6 group-hover:rotate-12 transition-transform" />
//                                     <span className="text-lg">
//                                         {!roomData.roomNo ? 'Select Room First' : dayCount === 0 ? 'Select Dates' : 'Add to Booking'}
//                                     </span>
//                                     <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
//                                 </button>
//                             </div>

//                             {/* Booking Summary */}
//                             {dayCount > 0 && roomData.price && (
//                                 <div className="mt-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
//                                     <h4 className="font-bold text-emerald-800 mb-2">Booking Summary</h4>
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div>
//                                             <p className="text-sm text-emerald-600">Rate per night</p>
//                                             <p className="font-bold text-emerald-800">{roomData.price.toFixed(2)} SD</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-sm text-emerald-600">Total nights</p>
//                                             <p className="font-bold text-emerald-800">{dayCount} nights</p>
//                                         </div>
//                                         <div className="col-span-2 pt-3 border-t border-emerald-200">
//                                             <div className="flex justify-between items-center">
//                                                 <p className="text-lg font-bold text-emerald-800">Total Amount</p>
//                                                 <p className="text-2xl font-bold text-emerald-800">
//                                                     {(roomData.price * dayCount).toFixed(2)} SD
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Right Section - Customer, Cart, Bill */}
//                     <div className="w-full lg:w-96 flex flex-col gap-4 md:gap-6">
//                         {/* <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//                             <CustomerInfo />
//                         </div> */}
                        
                        
                        
//                         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//                             <Bill />
//                         </div>
//                         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//                             <CartInfo />
//                         </div>
                        
//                     </div>
//                 </div>
//             </div>

//             {/* Select Customer Modal */}
//             {isSelectCustomer && (
//                 <SelectCustomer setIsSelectCustomer={setIsSelectCustomer} />
//             )}

//             {/* Add Customer Modal */}
        

//             {isAddCustomerModal &&
//                 <CustomerAdd
//                     setIsAddCustomerModal={setIsAddCustomerModal}
//                     fetchCustomers={fetchCustomers}
//                 />
//             }
//         </section>
//     );
// };

// export default Menu;
