import React from 'react'
import BackButton from '../components/shared/BackButton';
import BottomNav from '../components/shared/BottomNav';
import ExtraMenuContainer from '../components/addservices/ExtraMenuContainer';
import ExtraCartInfo from '../components/addservices/ExtraCartInfo';
import ExtraBills from '../components/addservices/ExtraBills';
import ExtraBill from '../components/addservices/ExtraBill';

import {useSelector} from 'react-redux';
import { IoBedOutline } from "react-icons/io5";
import { MdPhoneInTalk, MdOutlineRestaurantMenu } from "react-icons/md";
import { FaConciergeBell, FaShoppingCart, FaReceipt } from "react-icons/fa";

const AddServices = () => {
    
    const orderData = useSelector(state => state.order);    // order Id to add   || {orderData._id}

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                         
                        <div className="flex items-center gap-4">
                            <div className ='bg-white flex items-center rounded-full'><BackButton /></div>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2.5 rounded-lg">
                                    <FaConciergeBell className="text-white text-xl" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white">Extra Services</h1>
                                    <p className="text-green-100 text-xs">Add additional services to order</p>
                                </div>
                            </div>
                        </div> 

                        {/* Customer Info Card */}
                        <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                                <span className="text-sm font-medium text-white">
                                    {orderData.customerDetailsName || 'Customer Name'}
                                </span>
                            </div>
                            <div className="w-px h-6 bg-white/20"></div>
                            <div className="flex items-center gap-2">
                                <MdPhoneInTalk className="text-green-300" size={16} />
                                <span className="text-sm text-white">
                                    {orderData.customerDetailsPhone || 'Contact No'}
                                </span>
                            </div>
                            <div className="w-px h-6 bg-white/20"></div>
                            <div className="flex items-center gap-2">
                                <IoBedOutline className="text-green-300" size={16} />
                                <span className="text-sm text-white font-medium">
                                    Room {orderData.Room || 'N/A'}
                                </span>
                            </div>
                           
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Side - Menu Container (2/3 width) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Menu Header */}
                            <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <MdOutlineRestaurantMenu className="text-green-600 text-xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">Services Menu</h2>
                                        <p className="text-xs text-gray-500">Select additional services for this order</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Menu Content */}
                            <div className="p-2">
                                <ExtraMenuContainer />
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Cart & Bill (1/3 width) */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Bill Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <FaReceipt className="text-white text-lg" />
                                    <h3 className="text-white font-semibold">Bill Summary</h3>
                                </div>
                            </div> */}
                            <div className="p-2">
                                <ExtraBill />
                            </div>
                        </div>

                        {/* Cart Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <FaShoppingCart className="text-white text-lg" />
                                    <h3 className="text-white font-semibold">Selected Items</h3>
                                </div>
                            </div>
                            <div className="p-5">
                                <ExtraCartInfo />
                            </div>
                        </div>

                        
                    </div>
                </div>

            </div>

            {/* Bottom Navigation (if needed) */}
            {/* <BottomNav /> */}
        </div>
    )
}

export default AddServices;