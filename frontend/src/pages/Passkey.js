import React, { useState, useEffect, useRef } from 'react';
import usePasskey from '../usePasskey';
import { useParams, redirect, Link, useNavigate } from "react-router-dom";
import posthog from 'posthog-js'

function Passkey () {

  const [input, setInput] = useState(null);
  const [passkey, setPasskey] = usePasskey(null);
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate();

  const handleSubmit = async (event) => {
    setLoading(true)
    event.preventDefault();

    const response = await fetch(process.env.REACT_APP_API_ROOT + '/validate-passkey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({passkey: input}),
    })

    setLoading(false)
    if (response.ok) {
        posthog.alias(input)
        setPasskey(input)
        window.location.reload(false);

    }
    else {
        alert("Invalid passkey! Please try again.")
    }
  }

  return (
      <div className="bg-[url('/assets/bg-phone.jpg')] md:bg-[url('/assets/bg.jpg')] w-full h-screen flex flex-col items-center mb-4 justify-center gap-4">
        <div className= " text-lg w-5/6 md:text-4xl md:w-1/3 text-center font-sans text-orange-300 mb-4 font-bold">Enter your passcode</div>
        <input
          className="w-2/4 md:w-1/4 h-16 pl-4 bg-white placeholder:text-slate-500 rounded-md font-gilroy text-md border-2 border-orange-300"
          placeholder="this-is-a-passkey"
          type="text"
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className={"rounded-md text-lg w-2/4 md:w-1/4 h-16 text-white bg-orange-300 disabled:opacity-50"}
          onClick={handleSubmit}
          disabled={loading}
        >
          Validate
        </button>
        {loading && <div id="loading-spinner" className="self-center text-center">
          <div role="status">
            <svg width="100" height="100" className="animate-spin" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="25" stroke="url(#paint0_linear_451_5786)" stroke-width="10"/>
              <defs>
              <linearGradient id="paint0_linear_451_5786" x1="8.21168" y1="-32.8948" x2="146.326" y2="-26.3838" gradientUnits="userSpaceOnUse">
              <stop stop-color="#F55E54"/>
              <stop offset="0.192708" stop-color="#FFC632" stop-opacity="0.65625"/>
              <stop offset="0.515625" stop-color="#48FF2B"/>
              <stop offset="0.770833" stop-color="#1720F3" stop-opacity="0.99"/>
              <stop offset="0.953125" stop-color="#B82AAA"/>
              </linearGradient>
              </defs>
            </svg>
          </div>
        </div>}
        <button className="text-white font-gilroy absolute bottom-0 right-0 text-lg m-4 border-2 border-slate-600 rounded-lg p-4" onClick={() => {window.open("https://buy.stripe.com/8wM9Dv8Mv8Z005q7ss", '_blank')}}>Want access?</button>
      </div>
  )

}
export default Passkey;
