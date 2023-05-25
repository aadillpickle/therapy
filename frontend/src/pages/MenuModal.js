// MenuModal.js
import React from 'react';
import Modal from "react-modal";


function MenuModal({isOpen, onRequestClose, menuOptions}) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="bg-gradient-to-l from-[#EFDBF7] to-[#E8D0F0] p-4 rounded-lg shadow-md max-w-md mx-auto mt-10 absolute top-0 right-0 mb-12 mr-12"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end pb-4 pr-4"
    >
      {menuOptions.map(option => (
        <div 
          key={option.text} 
          className={
            `menu-item font-janna py-3 px-6 cursor-pointer transition-colors duration-200 flex justify-between items-center ` +
            `${option.text.includes('Delete') ? 'hover:bg-red-300' : 'hover:bg-gradient-to-r from-[#E3F7DB] to-[#D8F0D0]'}`
          }
          onClick={option.action}
        >
          {option.text}
          <div className="text-lg ml-4">
            {option.icon()}
          </div>
        </div>
      ))}
    </Modal>
  )
}

export default MenuModal;
