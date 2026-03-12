import React, { useState } from 'react';
import { FaDollarSign } from 'react-icons/fa';
import RateManagementModal from '../components/rate/RateManagementModal';

const RatesPage = () => {
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  
  const handleRatesRefresh = () => {
    console.log('Rates were updated, refresh the list');
    // You can add your refresh logic here
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <FaDollarSign className="w-6 h-6" />
              </div>
              Rates Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your pricing rates and configurations
            </p>
          </div>
          
          <button
            onClick={() => setIsRateModalOpen(true)}
            className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg font-medium"
          >
            <FaDollarSign className="h-5 w-5" />
            Manage Rates
          </button>
        </div>
        
        {/* Main content */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-center py-12">
            <FaDollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">Manage Your Rates</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Click the button above to open the rates management modal where you can add, edit, and manage all your pricing rates.
            </p>
            <button
              onClick={() => setIsRateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <FaDollarSign />
              Open Rates Management
            </button>
          </div>
        </div>
      </div>
      
      {/* Rate Management Modal */}
      <RateManagementModal
        open={isRateModalOpen}
        setOpen={setIsRateModalOpen}
        refreshRates={handleRatesRefresh}
      />
    </div>
  );
};

export default RatesPage;