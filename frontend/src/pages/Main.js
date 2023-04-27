import React, { useState, useEffect, useRef } from "react";
import Passkey from "./Passkey";
import MessageHistory from "./MessageHistory";
import Modal from "react-modal";
import usePasskey from "../usePasskey";
import VoiceRecorderButton from "./VoiceRecorderButton";
import PlayAudioButton from "./PlayAudioButton";

Modal.setAppElement("#root");

function Main() {
  const inputRef = useRef(null);
  const [data, setData] = useState("");
  const [passkey, setPasskey] = usePasskey(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [receivedAudio, setReceivedAudio] = useState(null);
  const [audioButtonHidden, setAudioButtonHidden] = useState(true);
  const [buttonText, setButtonText] = useState('Delete all my chat data');

  const toggleHistoryModal = () => {
    setIsHistoryModalOpen(!isHistoryModalOpen);
  };

  const handleTranscription = (transcript) => {
    inputRef.current.value += transcript;
    inputRef.current.selectionStart = inputRef.current.selectionEnd =
      inputRef.current.value.length;
    inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    inputRef.current.scrollTop = inputRef.current.scrollHeight;
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    setAudioButtonHidden(true);
    const input = inputRef.current.value;
    inputRef.current.value = "";
    event.preventDefault();
    
    const resp = await fetch(process.env.REACT_APP_API_ROOT + "/therapize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ passkey, input, message_history: messageHistory }),
    });

    const response = await resp.json();
    let responseData = response["message"];
    // console.log(data)
    

    const resp2 = await fetch(process.env.REACT_APP_API_ROOT + "/get-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({text: responseData["therapist_response"]}),
    });
    const blob = await resp2.blob();
    const audioURL = URL.createObjectURL(blob);
    setReceivedAudio(audioURL);
    
    setMessageHistory(responseData["message_history"]);
    setData(responseData["therapist_response"]);

    setLoading(false);
    setAudioButtonHidden(false);
  };

  const deleteAllData = async () => {
    const response = await fetch(
      process.env.REACT_APP_API_ROOT + "/delete-all-data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passkey }),
      }
    );

    if (response.ok) {
      setButtonText("Deleted data!");
    } else {
      setButtonText("Error, try again.");
    }

    // Reset button text after 3 seconds
    setTimeout(() => {
      setButtonText("Delete all my chat data");
    }, 2000);
  };

  if (passkey === null || passkey === "" || passkey === undefined) {
    return <Passkey />;
  }

  return (
    <div className="bg-transparent w-full h-screen flex flex-col items-center mb-4 justify-center gap-4">
      <div className="text-lg w-5/6 md:text-4xl md:w-1/3 text-center font-sans text-slate-700 mb-4 font-bold">
        How are you, really?
      </div>
        <textarea
          id="message"
          rows="4"
          ref={inputRef}
          class="block p-2.5 w-3/4 md:w-1/3 text-base text-slate-600 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          placeholder="im upset"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit(event);
            }
          }}
        ></textarea>
      <VoiceRecorderButton
          onTranscribe={handleTranscription}
        />
      <button
        className={
          "rounded-md text-lg w-3/4 md:w-1/3 h-16 text-white bg-slate-800 disabled:opacity-50"
        }
        onClick={handleSubmit}
        disabled={loading}
      >
        Submit
      </button>
      {loading && (
        <div id="loading-spinner" className="self-center text-center">
          <div role="status">
            <svg
              width="100"
              height="100"
              className="animate-spin"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="25"
                stroke="url(#paint0_linear_451_5786)"
                stroke-width="10"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_451_5786"
                  x1="8.21168"
                  y1="-32.8948"
                  x2="146.326"
                  y2="-26.3838"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#D3D3D3" />
                  <stop
                    offset="0.192708"
                    stop-color="#D3D3D3"
                    stop-opacity="0.65625"
                  />
                  <stop offset="0.515625" stop-color="#000000" />
                  <stop
                    offset="0.770833"
                    stop-color="#000000"
                    stop-opacity="0.99"
                  />
                  <stop offset="0.953125" stop-color="#B82AAA" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}
      {data && !loading && (
        <>
          <p className="mt-4 h-2/5 md:h-1/2 w-3/4 md:w-1/3 text-center align-middle text-base overflow-auto p-4 whitespace-pre-wrap text-black border-2 border-slate-200 rounded-md">
            {data}
          </p>
          {/* <div className="text-center text-xs">Scroll for more ↓</div> */}
        </>
      )}
      {receivedAudio && <PlayAudioButton hidden={audioButtonHidden} audio={receivedAudio} />}
      <button
        className="text-black font-gilroy absolute bottom-0 right-0 text-xs md:text-lg m-4 border-2 border-slate-600 rounded-lg p-4"
        onClick={deleteAllData}
      >
        {buttonText}
      </button>
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
  );
}

export default Main;
