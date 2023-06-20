import React, { useState, useEffect } from 'react';

const MessageHistory = ({messageHistory, credits}) => {
  if (messageHistory.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto">
        <h2 className="text-xl font-janna font-bold mb-4">Message History</h2>
        <p className="text-gray-500 font-janna">No messages yet</p>
        <p className="text-gray-900 font-janna pt-2 text-center">You have {credits} messages left.</p>
      </div>
    );
  }
  else {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Message History</h2>
        <div className="max-h-[80vh] overflow-y-auto mb-4">
        {messageHistory.map((message, idx) => {
          if (idx === 0) return null;

          return (
            <div key={idx} className={`p-2 m-4 rounded-md ${message.role === 'assistant' ? 'bg-blue-200' : 'bg-green-200'}`}>
              <p className="font-bold">{message.role === 'assistant' ? 'Assistant' : 'User'}:</p>
              <p>{message.content}</p>
            </div>
          );
        })}
        </div>
        <p className="text-gray-900 text-center">You have {credits} messages left.</p>
      </div>
    );
  }
 
};

export default MessageHistory;