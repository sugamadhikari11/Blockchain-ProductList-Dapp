// EditProductPopup.js
import React, { useState } from 'react';
import Popup from 'reactjs-popup';

const EditProductPopup = ({ product, onEdit, onClose }) => {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);

  const handleEdit = () => {
    onEdit(product.id, name, price);
    onClose(); // Close the popup after editing
  };

  return (
    <Popup open={true} onClose={onClose} modal>
      <div className="popup-content">
        <h2>Edit Product</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
        />
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (ETH)"
        />
        <button onClick={handleEdit}>Update Product</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Popup>
  );
};

export default EditProductPopup;