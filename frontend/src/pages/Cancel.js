import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const Cancel = () => {
  let navigate = useNavigate();

  return (
    <div className = "flex flex-col items-center h-screen justify-center">
      <div className="text-4xl w-1/3 text-center font-sans text-slate-700 mb-4 font-bold">Payment Cancelled - go back home</div>
      <button onClick={()=> {navigate("/")}} className="text-black font-gilroy text-lg m-4 border-2 border-slate-600 rounded-lg px-6 p-4">Home</button>
    </div>
  );
}

export default Cancel;
