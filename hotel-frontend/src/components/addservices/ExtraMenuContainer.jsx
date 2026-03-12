import React, {useState, useEffect } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getCategories, getServices } from '../../https';
import { enqueueSnackbar } from 'notistack';

import { MdHotelClass, MdCategory } from 'react-icons/md';
import { GrRadialSelected } from 'react-icons/gr';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { BiGridAlt } from 'react-icons/bi';
import { getBgColor } from '../../utils';
import ExtraItemsCard from './ExtraItemsCard';

const ExtraMenuContainer = () =>  {
    // States
    const [services, setServices] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [pagination, setPagination] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showCategoryList, setShowCategoryList] = useState(true);

    // Fetch categories from DB
    const { data: responseData, isError, error } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            return await getCategories();
        },
        placeholderData: keepPreviousData,
    });
    
    if (isError) {
        enqueueSnackbar(error?.message || 'Something went wrong!', { variant: 'error' });
    }
    
    console.log('Categories:', responseData); 

    // Fetch services function
    const fetchServices = async (filters = {}) => {
        try {
            const response = await getServices({
                category: filters.category || (selectedCategory === 'all' ? '' : selectedCategory),
                serviceName: filters.serviceName || 'all',
                search: filters.search || searchTerm,
                sort: filters.sort || '-createdAt',
                page: filters.page || 1,
                limit: filters.limit || 12
            });
            setServices(response.data.data || response.data.services || []);
            setPagination(response.data.pagination || {});
        } catch (error) {
            console.error('Error fetching services:', error);
            enqueueSnackbar('Failed to load services', { variant: 'error' });
        }
    };

    // Fetch services when category changes
    useEffect(() => {
        fetchServices({
            category: selectedCategory === 'all' ? '' : selectedCategory,
            page: 1
        });
    }, [selectedCategory]);

    // Initial fetch
    useEffect(() => {
        fetchServices();
    }, []);

    // Handle search
    const handleSearch = () => {
        fetchServices({ page: 1 });
    };

    // Handle search input change with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== '') {
                fetchServices({ page: 1 });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle key press for search
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Toggle category sidebar on mobile
    const toggleCategorySidebar = () => {
        setShowCategoryList(!showCategoryList);
    };

    return (
        <div className="flex w-full gap-1 justify-start items-start p-1 bg-gray-50 min-h-[calc(92vh)]">
            
            {/* Categories Sidebar - Desktop */}
            <div className={`flex-col justify-between p-4 w-[28%] bg-white rounded-2xl shadow-lg border border-gray-200 h-[calc(88vh)] overflow-hidden transition-all duration-300 ${!showCategoryList ? 'hidden' : 'hidden md:flex'}`}>
                {/* Sidebar Header */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <MdCategory className="text-green-600 text-lg" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Categories</h3>
                    <span className="ml-auto bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                        {responseData?.data?.data?.length || 0}
                    </span>
                </div>

                {/* Categories List - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                    {/* "All Categories" Button */}
                    <button
                        className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center justify-between ${
                            selectedCategory === 'all' 
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md' 
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        <div className="flex items-center gap-3">
                            <BiGridAlt className={selectedCategory === 'all' ? 'text-white' : 'text-gray-400'} size={18} />
                            <span className="text-sm font-medium">All Categories</span>
                        </div>
                        {selectedCategory === 'all' && <GrRadialSelected className="text-white" size={16} />}
                    </button>

                    {/* Category Buttons */}
                    {responseData?.data?.data?.map((category, index) => (
                        <button
                            key={category._id}
                            className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center justify-between ${
                                selectedCategory === category.categoryName
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md'
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                            onClick={() => setSelectedCategory(category.categoryName)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${
                                    selectedCategory === category.categoryName ? 'bg-white' : 'bg-green-500'
                                }`} />
                                <span className="text-sm font-medium truncate">{category.categoryName}</span>
                            </div>
                            {selectedCategory === category.categoryName && <GrRadialSelected className="text-white" size={16} />}
                        </button>
                    ))}
                </div>

                {/* Categories Count Footer */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Total Categories</span>
                        <span className="font-semibold text-green-600">
                            {responseData?.data?.data?.length || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Mobile Category Toggle Button */}
            <button 
                onClick={toggleCategorySidebar}
                className="md:hidden fixed bottom-20 right-4 z-10 bg-green-600 text-white p-3 rounded-full shadow-lg"
            >
                <MdCategory size={24} />
            </button>

            {/* Services Grid */}
            <div className={`flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-[calc(88vh)] ${!showCategoryList ? 'w-full' : 'md:w-[82%]'}`}>
                {/* Services Header */}
                <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <MdHotelClass className="text-green-600 text-xl" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Services</h2>
                                <p className="text-xs text-gray-500">
                                    {selectedCategory === 'all' 
                                        ? 'All categories' 
                                        : `Category: ${selectedCategory}`}
                                </p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Search services..."
                                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                />
                                <FaSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <FaSearch size={14} />
                                <span className="hidden md:inline">Search</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Services Grid Content */}
                <div className="h-[calc(88vh-80px)] overflow-y-auto custom-scrollbar p-6">
                    {services.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                            {services.map((service) => (
                                <ExtraItemsCard
                                    key={service._id}
                                    id={service._id}
                                    name={service.serviceName || service.name}
                                    price={service.price || service.salePrice}
                                    qty={service.qty}
                                    unit={service.unit}
                                    cat={service.category || service.categoryName}
                                    description={service.description}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="p-6 bg-gray-100 rounded-full mb-4">
                                <MdHotelClass className="text-gray-400 text-4xl" />
                            </div>
                            <p className="text-gray-500 text-center">
                                {searchTerm 
                                    ? `No services found matching "${searchTerm}"`
                                    : 'No services available in this category'}
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        fetchServices({ page: 1 });
                                    }}
                                    className="mt-4 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination Info */}
                {pagination?.totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                            Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchServices({ page: (pagination.currentPage || 1) - 1 })}
                                disabled={pagination.currentPage <= 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchServices({ page: (pagination.currentPage || 1) + 1 })}
                                disabled={pagination.currentPage >= pagination.totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    )
}

export default ExtraMenuContainer;


// import React, {useState, useEffect } from 'react'
// import { keepPreviousData, useQuery } from '@tanstack/react-query';
// import { getCategories, getServices } from '../../https';

// import { MdHotelClass } from 'react-icons/md';
// import { GrRadialSelected } from 'react-icons/gr';
// import { getBgColor } from '../../utils';
// import ExtraItemsCard from './ExtraItemsCard';

// const ExtraMenuContainer = () =>  {

// // fetch categories from DB :-
//     const { data: responseData, IsError } = useQuery({
//         queryKey: ['categories'],
    
//         queryFn: async () => {
//         return await getCategories();
//         },
                    
//         placeholderData: keepPreviousData,
//     });
    
//     if (IsError) {
//         enqueueSnackbar('Something went wrong!', { variant: 'error' });
//     }
//     console.log(responseData); 



//     // fetch Sevices

//     // const { data: resData, isError} = useQuery({
//     // queryKey :['services'],
    
//     // queryFn : async () => {
//     //     return await getServices();
//     // },
//     //     placeholderData: keepPreviousData,
//     // });
//     // if(isError) {
//     //     enqueueSnackbar('Something went wrong!', { variant: 'error' })
//     // }
//     // console.log(resData); 
//     // Old way (GET request)
    
//     // secont method :-
//     // const fetchServices = async () => {
//     //   try {
//     //     const response = await getServices();
//     //     setServices(response.data);
//     //   } catch (error) {
//     //     console.error(error);
//     //   }
//     // };
    

//     // Update how you call the function in your components :-
//     // New way (POST request with filters)

//     const [services, setServices] = useState([]);
//     const [selectedCategory, setSelectedCategory] = useState('all');
//     const [pagination, setPagination] = useState({});

//     const fetchServices = async (filters = {}) => {
//         try {
//             const response = await getServices({
//                 category: filters.category || 'all',
//                 serviceName: filters.serviceName || 'all',
//                 search: filters.search || '',
//                 sort: filters.sort || '-createdAt',
//                 page: filters.page || 1,
//                 limit: filters.limit || 10
//             });
//             setServices(response.data.data || response.data.services);
//             setPagination(response.data.pagination);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     // Fetch services when category changes
//     useEffect(() => {
//         fetchServices({
//             category: selectedCategory === 'all' ? '' : selectedCategory,
//             page: 1 // Reset to first page when category changes
//         });
//     }, [selectedCategory]);

//     // Initial fetch
//     useEffect(() => {
//         fetchServices(); // Fetch all services initially
//     }, []);



  
    
// return (
//     <>

//         <div className='flex w-full gap-1 justify-start items-start p-1'>
            
//             {/* Categories Sidebar */}
//             <div className='flex-col justify-between p-2 w-[16%] bg-white shadow-xl/30 rounded-md h-[calc(92vh)]'>
//                 {/* Add "All" category button */}
//                 <button
//                     className='w-[100%] grid grid-cols-1 p-1 items-center mb-3 rounded-lg h-[50px] cursor-pointer shadow-lg/30'
//                     style={{ backgroundColor: selectedCategory === 'all' ? getBgColor() : '#f3f4f6' }}
//                     onClick={() => setSelectedCategory('all')}
//                 >
//                     <div className='flex items-center justify-between w-full shadow-lg/30'>
//                         <h1 className='text-xs font-semibold' style={{ color: selectedCategory === 'all' ? 'white' : 'black' }}>
//                             All Categories
//                         </h1>
//                         {selectedCategory === 'all' && <GrRadialSelected className='text-[#e6e6e6]' size={20} />}
//                     </div>
//                 </button>

//                 {responseData?.data.data.map(category => (
//                     <button
//                         key={category._id}
//                         className='w-[100%] grid grid-cols-1 p-1 items-center mb-3 rounded-lg h-[50px] 
//                         cursor-pointer shadow-lg/30 '
//                         style={{ backgroundColor: selectedCategory === category.categoryName ? getBgColor() : '#f3f4f6' }}
//                         onClick={() => setSelectedCategory(category.categoryName)}
//                     >
//                         <div className='flex items-center justify-between w-full shadow-lg/30'>
//                             <h1
//                                 className='text-xs font-semibold'
//                                 style={{ color: selectedCategory === category.categoryName ? 'white' : 'black' }}
//                             >
//                                 {category.categoryName}
//                             </h1>
//                             {selectedCategory === category.categoryName && <GrRadialSelected className='text-[#e6e6e6]' size={20} />}
//                         </div>
//                     </button>
//                 ))}
//             </div>

//             {/* Services Grid */}
//             <div className='flex h-[calc(92vh)] items-start justify-between flex-wrap gap-2 px-2 py-2 bg-white rounded-lg overflow-y-scroll scrollbar-hidden w-[84%]'>
//                 {services.length > 0 ? (
//                     services.map((service) => (
//                         <ExtraItemsCard
//                             key={service._id}
//                             id={service._id}
//                             name={service.serviceName}
//                             price={service.price}
//                             qty={service.qty}
//                             unit={service.unit}
//                             cat={service.category}
//                         />
//                     ))
//                 ) : (
//                     <div className="flex items-center justify-center w-full h-32">
//                         <p className="text-gray-500">No services found in this category</p>
//                     </div>
//                 )}
//             </div>
//         </div>

//     </>

//     )
// }

// export default ExtraMenuContainer