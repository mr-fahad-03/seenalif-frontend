import React from 'react';
import { useNavigate } from 'react-router-dom';

const MaintenancePage = () => {
  const navigate = useNavigate();

  const handleContactUs = () => {
    // Open WhatsApp with the provided number
    window.open(`https://wa.me/971505033860`, '_blank');
  };

  const handleCheckStatus = () => {
    // Refresh the page to check if maintenance is over
    window.location.reload();
    
    // Alternative: Navigate to home page
    // navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-white rounded-2xl p-8 max-w-6xl w-full">
        {/* Logo positioned above the GIF container */}
   

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left Side - GIF */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="max-w-md w-full rounded-xl overflow-hidden">

                   <img 
            src="https://res.cloudinary.com/dyfhsu5v6/image/upload/v1759436194/admin-logo_qfrtyy.svg" 
            alt="Company Logo" 
            className="h-20"
          />


              <img 
                src="https://cdn.dribbble.com/userupload/29169647/file/original-99e9f79da3ce1142c8457352925feb69.gif" 
                alt="Maintenance in progress"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            {/* Main Heading */}
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              We're Making Improvements
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-6">
              Our website is currently undergoing scheduled maintenance to bring you an even better experience.
            </p>

            {/* Status Badge */}
            <div className="inline-block bg-lime-500 text-white px-6 py-2 rounded-full font-semibold mb-6">
              MAINTENANCE IN PROGRESS
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
              <div 
                className="bg-lime-500 h-3 rounded-full animate-pulse"
                style={{ width: '70%' }}
              ></div>
            </div>

            {/* Additional Info */}
            <p className="text-gray-600 mb-6">
              We're deploying new changes and enhancements. The site will be available again as soon as possible.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button 
                onClick={handleContactUs}
                className="bg-lime-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-lime-600 transition-colors duration-300 flex-1"
              >
                Contact Us 
              </button>
              <button 
                onClick={handleCheckStatus}
                className="border-2 border-lime-500 text-lime-500 px-8 py-3 rounded-full font-semibold hover:bg-lime-500 hover:text-white transition-colors duration-300 flex-1"
              >
                Check Status
              </button>
            </div>

            {/* Estimated Time */}
            <div className=" p-4 bg-lime-50 rounded-lg">
              <p className="text-gray-700">
                <span className="font-semibold">Estimated completion:</span>{' '}
                <span className="text-lime-600">30-45 minutes</span>
              </p>
            </div>

          
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;


