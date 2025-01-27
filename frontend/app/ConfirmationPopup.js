// ConfirmationPopup.js
import React from 'react';
import Popup from 'reactjs-popup';

const ConfirmationPopup = ({ open, onClose, onConfirm }) => {
  return (
    <Popup open={open} onClose={onClose} modal>
      <div className="bg-gray-200 rounded-lg shadow-lg p-6">
        <h2 className="text-lg text-black font-semibold mb-4">Are you sure you want to delete this product?</h2>
        <div className="flex justify-between">
          <button 
            onClick={onConfirm} 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
          >
            Yes, Delete
          </button>
          <button 
            onClick={onClose} 
            className="bg-blue-400 text-black-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default ConfirmationPopup;