import React, { useState, useEffect, useRef } from "react";
import GoogleLoginButton from "./GoogleLoginButton";
import useUserInfo from '../useUserInfo';
import LoadingSpinner from "../LoadingSpinner";
import Credits from "./Credits";
import MessageHistory from "./MessageHistory";
import Modal from "react-modal";
import VoiceRecorderButton from "./VoiceRecorderButton";
import PlayAudioButton from "./PlayAudioButton";

Modal.setAppElement("#root");

function Main() {
  const inputRef = useRef(null);
  const [data, setData] = useState("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [receivedAudio, setReceivedAudio] = useState(null);
  const [audioButtonHidden, setAudioButtonHidden] = useState(true);
  const [buttonText, setButtonText] = useState('Delete all my chat data');
  const [userInfo, setUserInfo] = useUserInfo('userInfo');
  const [credits, setCredits] = useState(0);

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

  const getCredits = async () => {
    const resp = await fetch(process.env.REACT_APP_API_ROOT + "/credits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: userInfo.email }),
    });
    const response = await resp.json();
    setCredits(response["message"]);
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    setAudioButtonHidden(true);
    const input = inputRef.current.value;
    inputRef.current.value = "";
    event.preventDefault();
    const requestParams = {input, message_history: messageHistory};
    if (userInfo.email)
    {
      requestParams['email'] = userInfo.email;
    }
   
    const resp = await fetch(process.env.REACT_APP_API_ROOT + "/therapize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestParams),
    });

    const response = await resp.json();
    let responseData = response["message"];
    
    if (responseData["therapist_response"]) {
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
      setAudioButtonHidden(false);
    } else {
      setData(responseData)
    }
    setLoading(false);
  };

  const deleteAllData = async () => {
    const response = await fetch(
      process.env.REACT_APP_API_ROOT + "/delete-all-data",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userInfo.email }),
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
  return (
    <div className="bg-transparent w-full h-screen flex flex-col items-center mb-4 justify-center gap-4">
      <div className="text-lg w-5/6 md:text-4xl md:w-1/3 text-center font-sans text-slate-700 mb-4 font-bold">
        How are you, really?
      </div>
        <textarea
          id="message"
          rows="4"
          ref={inputRef}
          maxLength={625}
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
      {loading && (<LoadingSpinner/>)}
      {data && !loading && (
        <>
          <p className="mt-4 h-2/5 md:h-1/2 w-3/4 md:w-1/3 text-center align-middle text-base overflow-auto p-4 whitespace-pre-wrap text-black border-2 border-slate-200 rounded-md">
            {data}
          </p>
          {/* <div className="text-center text-xs">Scroll for more ↓</div> */}
        </>
      )}
      {receivedAudio && <PlayAudioButton hidden={audioButtonHidden} audio={receivedAudio} />}
      {userInfo.email && <><button
        className="text-black font-gilroy absolute bottom-0 right-0 text-xs md:text-lg m-4 border-2 border-slate-600 rounded-lg p-4"
        onClick={deleteAllData}
      >
        {buttonText}
      </button>
      <button
        className="text-black font-gilroy absolute bottom-0 left-0 text-xs md:text-lg m-4 border-2 border-slate-600 rounded-lg p-4"
        onClick={() => {toggleHistoryModal(); getCredits();}}
      >
        Show chat history
      </button>
      <Credits/>
      </>}
      {!userInfo.email && <>
        <GoogleLoginButton />
        <div className="text-sm font-gilroy text-center">Make an account for 10 bonus credits (by default, you have 5)<br></br> and access to message history + future premium features!</div>
      </>}
      <Modal
        isOpen={isHistoryModalOpen}
        onRequestClose={toggleHistoryModal}
        className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto mt-10"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center"
      >
        <MessageHistory messageHistory={messageHistory} credits={credits} />
      </Modal>
    </div>
  );
}

export default Main;
