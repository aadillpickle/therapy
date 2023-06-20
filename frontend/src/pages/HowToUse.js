import React, { useState, useEffect } from 'react';

const HowToUse = () => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto">
        <h2 className="text-xl font-janna font-bold mb-4">How to Talk to Tori</h2>
        <ul className="list-disc ml-4">
            <li className="text-gray-500 font-janna">Tell Tori about what's on your mind and she'll ask you more about it.</li>
            <li className="text-gray-500 font-janna">Tori remembers what you've talked about. Try asking "What do you remember about me?" for a summary.</li>
            <li className="text-gray-500 font-janna">Tori is still learning. If she doesn't understand you, try rephrasing your question and asking again.</li>
        </ul>
       
      </div>
    );
 
};

export default HowToUse;