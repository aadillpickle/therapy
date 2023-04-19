import React, { useState, useEffect, useRef } from 'react';
import Passkey from './Passkey';
import MessageHistory from './MessageHistory';
import Modal from 'react-modal';
import usePasskey from '../usePasskey';

Modal.setAppElement('#root');

function Main () {
  const inputRef = useRef(null);
  const [data, setData] = useState("");
  const [passkey, setPasskey] = usePasskey(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);

  const toggleHistoryModal = () => {
    setIsHistoryModalOpen(!isHistoryModalOpen);
  };

  const handleSubmit = async (event) => {
    setLoading(true)
    const input = inputRef.current.value;
    inputRef.current.value = "";
    event.preventDefault();
    const resp = await fetch(process.env.REACT_APP_API_ROOT + '/therapize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({passkey, input, message_history: messageHistory}),
    })

    const response = await resp.json()
    let data = response["message"]
    // console.log(data)
    setMessageHistory(data["message_history"])
    setData(data["therapist_response"])

    setLoading(false)
  }

  const deleteAllData = async () => {
    setLoading(true)
    const response = await fetch(process.env.REACT_APP_API_ROOT + '/delete-all-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({passkey}),
    })
    
    setLoading(false)
    if (response.ok) {
        alert("All data deleted!")
    }
    else {
        alert("Error deleting data!")
    }

  }

  if (passkey === null || passkey === "" || passkey === undefined) {
    return (<Passkey/>)
  }

  return (
      <div className="bg-transparent w-full h-screen flex flex-col items-center mb-4 justify-center gap-4">
        <div className= " text-lg w-5/6 md:text-4xl md:w-1/3 text-center font-sans text-slate-700 mb-4 font-bold">How are you, really?</div>
        <input
          className="w-3/4 md:w-1/3 h-16 pl-4 bg-white placeholder:text-slate-400 rounded-md font-gilroy text-md border-2 border-slate-500"
          placeholder="im upset"
          type="text"
          ref={inputRef}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSubmit(event);
            }
          }}
        />
        <button
          className={"rounded-md text-lg w-3/4 md:w-1/3 h-16 text-white bg-slate-800 disabled:opacity-50"}
          onClick={handleSubmit}
          disabled={loading}
        >
          Submit
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
        {/* {data && !loading && <><p className="mt-4 w-5/6 md:w-1/2 h-1/5 md:h-2/5 text-center text-base overflow-auto p-4 whitespace-pre-wrap text-black border-2 border-slate-200 rounded-md">{data}</p><div className="text-center text-xs">Scroll for more ↓</div></>} */}
        {data && !loading && <><p className="mt-4 w-1/2 md:w-1/4 h-1/12 md:h-1/6 text-center text-base overflow-auto p-4 whitespace-pre-wrap text-black border-2 border-slate-200 rounded-md">{data}</p><div className="text-center text-xs">Scroll for more ↓</div></>}
        <button className="text-black font-gilroy absolute bottom-0 right-0 text-xs md:text-lg m-4 border-2 border-slate-600 rounded-lg p-4" onClick={deleteAllData}>Delete all my chat data</button>
        <button
        className="text-black font-gilroy absolute bottom-0 left-0 text-xs md:text-lg m-4 border-2 border-slate-600 rounded-lg p-4"
        onClick={toggleHistoryModal}
      >
        Show chat history
      </button>
      <Modal
        isOpen={isHistoryModalOpen}
        onRequestClose={toggleHistoryModal}
        className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto mt-10"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center"
      >
        <MessageHistory messageHistory={messageHistory} />
      </Modal>
      </div>
  )

}

export default Main;
