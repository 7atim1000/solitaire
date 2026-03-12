import React, { useState, useEffect } from 'react' 
import { motion } from 'framer-motion'
import { IoCloseCircle, IoSearchOutline, IoRefresh } from 'react-icons/io5';
import { PiUserCircleCheckLight } from "react-icons/pi";
import { FaUserFriends, FaIdCard, FaEnvelope, FaPhone, FaMapMarkerAlt, FaDollarSign, FaSortAmountDown } from "react-icons/fa";
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { enqueueSnackbar } from 'notistack';
import { setCustomer } from '../../redux/slices/customerSlice';
import { api } from '../../https';

const SelectCustomer = ({ setIsSelectCustomer }) => {
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        guests: 1
    });

    const [list, setList] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClose = (customerId, customerName, Idnumber, email, contactNo, balance, guests) => {
        if (formData.guests === '') {
            enqueueSnackbar('Please specify number of guests', { variant: "warning" });
            return;
        }

        dispatch(setCustomer({ 
            customerId, 
            customerName, 
            Idnumber, 
            email, 
            contactNo, 
            balance, 
            guests: formData.guests 
        }));
        setIsSelectCustomer(false);
    };

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await api.post('/api/customers/fetch', {
                search,
                sort,
                page: 1,
                limit: 1000
            });

            if (response.data.success) {
                setList(response.data.customers);
            } else {
                toast.error(response.data.message || 'Customers not found');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(error.message);
            }
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== '') {
                fetchCustomers();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleSortChange = () => {
        setSort(sort === '-createdAt' ? 'createdAt' : '-createdAt');
        fetchCustomers();
    };

    // ✅ NEW: Refresh function
    const handleRefresh = () => {
        fetchCustomers();
        toast.success('Customer list refreshed!', {
            theme: "colored",
            style: { backgroundColor: '#10b981' }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border-2 border-emerald-100"
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 md:p-6 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold">Select Customer</h2>
                            <p className="text-emerald-100 text-sm mt-1">Choose a customer for booking</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IoSearchOutline className="text-emerald-400" size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={handleSearch}
                                    placeholder="Search customers..."
                                    className="w-full hidden pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-emerald-300/30 rounded-lg text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                                />
                            </div>

                            {/* Guests Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUserFriends className="text-emerald-400" size={16} />
                                </div>
                                <input
                                    name="guests"
                                    value={formData.guests}
                                    onChange={handleInputChange}
                                    placeholder="Guests"
                                    type="number"
                                    min="1"
                                    className="hidden w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-emerald-300/30 rounded-lg text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Sort Button */}
                            <button
                                onClick={handleSortChange}
                                className="px-4 py-2.5 bg-emerald-500/20 backdrop-blur-sm border border-emerald-300/30 rounded-lg text-white hover:bg-emerald-500/30 transition-colors flex items-center gap-2"
                            >
                                <FaSortAmountDown />
                                <span className="hidden sm:inline">Sort</span>
                            </button>

                            {/* ✅ NEW: Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className={`px-4 py-2.5 bg-white/20 backdrop-blur-sm border border-blue-300/30 rounded-lg text-white hover:bg-blue-500/30 transition-colors flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <IoRefresh className={`${isLoading ? 'animate-spin' : ''}`} size={18} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => setIsSelectCustomer(false)}
                                className="px-4 py-2.5 bg-red-500/70 backdrop-blur-sm border border-red-300/30 rounded-lg text-white hover:bg-red-500/30 transition-colors flex items-center gap-2"
                            >
                                <IoCloseCircle size={20} />
                                <span className="hidden sm:inline">Close</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-4 md:p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                                <p className="mt-3 text-emerald-600">Loading customers...</p>
                            </div>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                <PiUserCircleCheckLight className="text-emerald-600" size={48} />
                            </div>
                            <h3 className="text-lg font-semibold text-emerald-800 mb-2">No Customers Found</h3>
                            <p className="text-emerald-600">Your customers list is empty. Start adding customers!</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-emerald-200">
                            {/* Table Header - Desktop */}
                            <div className="hidden md:grid grid-cols-7 bg-gradient-to-r from-emerald-50 to-green-50 p-4 border-b border-emerald-200">
                                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                                    <FaUserFriends />
                                    <span>Customer Name</span>
                                </div>
                                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                                    <FaIdCard />
                                    <span>ID Number</span>
                                </div>
                                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                                    <FaEnvelope />
                                    <span>Email</span>
                                </div>
                                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                                    <FaPhone />
                                    <span>Contact</span>
                                </div>
                                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                                    <FaMapMarkerAlt />
                                    <span>Address</span>
                                </div>
                                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                                    <FaDollarSign />
                                    <span>Balance</span>
                                </div>
                                <div className="flex items-center justify-center font-semibold text-emerald-700">
                                    <span>Select</span>
                                </div>
                            </div>

                            {/* Customers List */}
                            <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
                                {list.map((customer) => (
                                    <div key={customer._id} className="group">
                                        {/* Desktop View */}
                                        <div className="hidden md:grid grid-cols-7 p-4 border-b border-emerald-100 hover:bg-emerald-50/50 transition-colors">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                                                    <span className="text-sm font-semibold text-emerald-700">
                                                        {customer.customerName?.charAt(0) || 'C'}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-emerald-800 truncate">
                                                    {customer.customerName}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-emerald-600 font-mono">
                                                    {customer.Idnumber}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-emerald-600 truncate">
                                                    {customer.email}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-emerald-600">
                                                    {customer.contactNo}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-emerald-600 truncate">
                                                    {customer.address || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`text-sm font-semibold ${customer.balance === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {(Number(customer.balance) || 0).toFixed(2)} SD
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => handleClose(
                                                        customer._id,
                                                        customer.customerName,
                                                        customer.Idnumber,
                                                        customer.email,
                                                        customer.contactNo,
                                                        customer.balance,
                                                        formData.guests
                                                    )}
                                                    className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 hover:text-emerald-800 transition-colors transform hover:scale-105"
                                                    disabled={!formData.guests}
                                                    title={!formData.guests ? "Please enter number of guests first" : "Select customer"}
                                                >
                                                    <PiUserCircleCheckLight size={24} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mobile View */}
                                        <div className="md:hidden p-4 border-b border-emerald-100 hover:bg-emerald-50/50">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-bold text-emerald-700">
                                                                {customer.customerName?.charAt(0) || 'C'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-emerald-800">
                                                                {customer.customerName}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-emerald-600">
                                                                <FaIdCard size={12} />
                                                                <span>{customer.Idnumber}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleClose(
                                                            customer._id,
                                                            customer.customerName,
                                                            customer.Idnumber,
                                                            customer.email,
                                                            customer.contactNo,
                                                            customer.balance,
                                                            formData.guests
                                                        )}
                                                        className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                                        disabled={!formData.guests}
                                                        title={!formData.guests ? "Please enter number of guests first" : "Select customer"}
                                                    >
                                                        <PiUserCircleCheckLight size={20} />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <FaEnvelope className="text-emerald-500" size={14} />
                                                        <span className="text-emerald-600 truncate">{customer.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <FaPhone className="text-emerald-500" size={14} />
                                                        <span className="text-emerald-600">{customer.contactNo}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 col-span-2">
                                                        <FaMapMarkerAlt className="text-emerald-500" size={14} />
                                                        <span className="text-emerald-600">{customer.address || 'No address'}</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                                                            <span className="text-sm text-emerald-700">Balance</span>
                                                            <span className={`font-semibold ${customer.balance === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {(Number(customer.balance) || 0).toFixed(2)} SD
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Guests Warning */}
                    {!formData.guests && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-amber-600">⚠️</span>
                                <p className="text-sm text-amber-700">
                                    Please specify number of guests to select a customer
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-emerald-200 p-4 bg-gradient-to-r from-emerald-50 to-green-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-emerald-600">
                            <span className="font-semibold text-emerald-700">{list.length}</span> customers found
                        </div>
                        <div className="text-sm text-emerald-600">
                            Guests: <span className="font-semibold text-emerald-700">{formData.guests || '0'}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SelectCustomer;

// import React , { useState, useEffect } from 'react' 
// import { motion } from 'framer-motion'
// import { IoCloseCircle } from 'react-icons/io5';
// import { useDispatch } from 'react-redux'
// import { PiUserCircleCheckLight } from "react-icons/pi";

// import { toast } from 'react-toastify'
// import { enqueueSnackbar } from 'notistack';
// import { setCustomer } from '../../redux/slices/customerSlice';
// import { api } from '../../https';


// const SelectCustomer = ({setIsSelectCustomer}) => {

//     const dispatch = useDispatch();

//     const [formData, setFormData] = useState({
//         guests: ""
//     });

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };


//     const handleClose = (customerId, customerName, Idnumber, email, contactNo, balance, guests) => {
//         if (formData.guests === '') {
//             enqueueSnackbar('please specify number of guests', { variant: "warning" });
//             return;
//         }

//         dispatch(setCustomer({ customerId, customerName, Idnumber, email, contactNo, balance, guests }));
//         setIsSelectCustomer(false);
//     };

//     // fetch Customer
//     const [list, setList] = useState([]);
//     const [search, setSearch] = useState('');
//     const [sort, setSort] = useState('-createdAt');

//     const fetchCustomers = async () => {
//         try {
//              const response = await api.post('/api/customers/fetch',
//                   {
//                     search,
//                     sort,
//                     page: 1,
//                     limit: 1000
//                 }
//             );

//             if (response.data.success) {
//                 setList(response.data.customers)
//             } else {
//                 toast.error(response.data.message || 'customer not found')
//             }

//         } catch (error) {
//             // Show backend error message if present in error.response
//             if (error.response && error.response.data && error.response.data.message) {
//                 toast.error(error.response.data.message);
//             } else {
//                 toast.error(error.message)
//             }
//             console.log(error)
//         }
//     }

//     useEffect(() => {
//         fetchCustomers()
//     }, []);



//     return (
        
//         <div className='fixed inset-0 bg-opacity-50  flex items-center justify-center shadow-xl z-50' style={{ backgroundColor: 'rgba(5, 24, 1, 0.4)' }}>

//             <motion.div
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.9 }}
//                 transition={{ durayion: 0.3, ease: 'easeInOut' }}
//                 className='bg-white p-3 rounded-lg shadow-lg/30 w-170 h-[calc(100vh-2rem)] md:mt-5 mt-5 
//                border-b-2 border-emerald-600 
//                border-l-6 border-emerald-600 '
//             >


//                 {/*Modal Header */}
//                 <div className="flex justify-between items-center mb-4 shadow-xl p-1">
//                     <h2 className='text-sm font-semibold underline text-emerald-600'>Please select customer</h2>
                    
//                     <form>
//                         <input
//                             name='guests'
//                             value={formData.guests}
//                             onChange={handleInputChange}
//                             autoComplete='none'
//                             placeholder='Number of guests'
//                             className='bg-transparent shadow-lg/30 text-black p-1 rounded-lg text-xs font-medium p-2 border-b-2 border-emerald-600'
//                             required
//                         />
//                     </form>

//                     <button onClick={() => setIsSelectCustomer(false)} className='rounded-full text-[#be3e3f] 
//                     cursor-pointer hover:bg-[#be3e3f]/30'>
//                         <IoCloseCircle size={25} />
//                     </button>
//                 </div>

//                 {/*Modal Body*/}
//                 <div className='mt-5 bg-[#1f1f1f]'>


//                     <div className='overflow-x-auto bg-white'>
//                         <table className='text-left w-full'>
//                             <thead className=''>
//                                 <tr className='border-b-2 border-emerald-600 text-xs font-normal text-emerald-700'>
//                                     <th className='p-5'>Name</th>
//                                     <th className='p-5'>ID Number</th>
//                                     <th className='p-1'>Email</th>
//                                     <th className='p-1'>Contact No</th>
//                                     <th className='p-1'>Address</th>
//                                     <th className='p-1'></th>
//                                     <th className='p-1'></th>
//                                 </tr>
//                             </thead>

//                             <tbody>

//                                 {list.length === 0
//                                     ? (<p className='ml-5 mt-5 text-xs text-[#be3e3f] flex items-start justify-start'>Your customers list is empty . Start adding customers !</p>)
//                                     : list.map((customer, index) => (

//                                         <tr
//                                             // key ={index}
//                                             className='border-b border-emerald-100 text-xs font-normal text-[#1a1a1a]'
//                                         >
//                                             <td className='p-5' hidden>{customer._id}</td>
//                                             <td className='p-1'>{customer.customerName}</td>
//                                              <td className='p-1'>{customer.Idnumber}</td>
//                                             <td className='p-1'>{customer.email}</td>
//                                             <td className='p-1'>{customer.contactNo}</td>
//                                             <td className='p-1'>{customer.address}</td>
//                                             <td className={`p-1 ${customer.balance === 0 ? 'text-[#0ea5e9]' : 'text-[#be3e3f]'} text-sm font-bold`}>  {(Number(customer.balance) || 0).toFixed(2)}</td>
//                                             <td className='p-1'>

//                                                 <button className={`text-red-700 cursor-pointer text-sm font-semibold`}>
//                                                     <PiUserCircleCheckLight size={20} className='w-7 h-7 text-emerald-700 rounded-full   flex justify-end'
//                                                         onClick={() => handleClose(customer._id, customer.customerName, customer.Idnumber, customer.email, customer.contactNo, customer.balance, formData.guests)} />
//                                                 </button>

//                                             </td>

//                                         </tr>

//                                     ))}


//                             </tbody>
//                         </table>

//                     </div>
//                 </div>

//             </motion.div>
//         </div>

//     );
// };

// export default SelectCustomer ;