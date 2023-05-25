import React, { useState, useEffect, useRef } from "react";
import GoogleLoginButton from "./GoogleLoginButton";
import { IconContext } from "react-icons";

import useUserInfo from '../useUserInfo';
import { loadStripe } from "@stripe/stripe-js";
import LoadingSpinner from "../LoadingSpinner";
import MessageHistory from "./MessageHistory";
import Modal from "react-modal";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { AiOutlineDelete } from 'react-icons/ai'; // Import any other icons you need
import { MdPayment } from 'react-icons/md';
import { BiMessageDetail } from 'react-icons/bi';
import { BsArrowRight } from 'react-icons/bs';
import logo from "../assets/logo.png";
import MenuModal from './MenuModal';

Modal.setAppElement("#root");

function Main() {
  const inputRef = useRef(null);
  const [data, setData] = useState("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [deleteButtonText, setDeleteButtonText] = useState('Delete all chat data');
  const [userInfo, setUserInfo] = useUserInfo('userInfo');
  const [credits, setCredits] = useState(0);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isDataDisplayed, setIsDataDisplayed] = useState(false);

  useEffect(() => {
    if (data && !loading) {
      setIsDataDisplayed(true);
    }
  }, [data, loading]);

  let stripePromise;
  const getStripe = () => {
    if (!stripePromise) {
      stripePromise = loadStripe(
        `${process.env.REACT_APP_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
      );
    }
    return stripePromise;
  };

  const toggleMenuModal = () => {
    setIsMenuModalOpen(!isMenuModalOpen);
  };
  
  const toggleHistoryModal = () => {
    setIsHistoryModalOpen(!isHistoryModalOpen);
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

  async function handleCheckout() {
    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: process.env.REACT_APP_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1, // adjustable_quantity: {enabled: true, minimum: 1, maximum: 10}
        },
      ],
      successUrl: `${process.env.REACT_APP_CURRENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.REACT_APP_CURRENT_URL}/cancel`,
      customerEmail: userInfo.email,
      mode: "payment",
    });
  }

  const handleSubmit = async (event) => {
    setLoading(true);
    setData("");
    setIsDataDisplayed(false);
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
      setMessageHistory(responseData["message_history"]);
      setData(responseData["therapist_response"]);
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
      setDeleteButtonText("Deleted data!");
    } else {
      setDeleteButtonText("Error, try again.");
    }
    setTimeout(() => {
      setDeleteButtonText("Delete all my chat data");
    }, 2000);
  };
  const menuOptions = [
    {
      text: 'Buy more credits',
      action: () => {handleCheckout()},
      icon: () => <MdPayment />
    },
    {
      text: 'Show chat history',
      action: () => {toggleHistoryModal(); setIsMenuModalOpen(false); getCredits();},
      icon: () => <BiMessageDetail />
    },
    {
      text: deleteButtonText,
      action: deleteAllData,
      icon: () => <AiOutlineDelete />
    },
    
  ];
  return (
    <div className="bg-transparent w-full h-screen flex flex-col items-center mb-4 justify-center gap-4 bg-gradient-to-l from-[#EFDBF7] to-[#E8D0F0]">
      {/* <div className="absolute top-0 left-0"> <img src={logo} alt="TTT Logo" className="w-14 h-14 md:w-24 md:h-24 m-4" /></div> */}
      <div className="text-2xl font-amerigo text-slate-900 w-5/6 md:text-4xl md:w-1/3 text-center text-slate-700 md:mb-2">
        How are you, really?
      </div>
        <textarea
          id="message"
          rows="4"
          ref={inputRef}
          maxLength={625}
          class="font-janna block p-2.5 w-3/4 md:w-1/3 xl:w-1/4 text-base text-slate-600 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          placeholder="im upset"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSubmit(event);
            }
          }}
        ></textarea>
      <button
        className={
          "font-janna w-20 font-bold rounded-full bg-gradient-to-r from-[#E3F7DB] to-[#D8F0D0] p-4 disabled:opacity-50 flex items-center justify-center"
        }
        onClick={handleSubmit}
        disabled={loading}
      >
        <IconContext.Provider
          value={{ color: '#1E313B', size: '24px'}}
        >
          <div>
            <BsArrowRight />
          </div>
        </IconContext.Provider>
        
      </button>
      {loading && (<LoadingSpinner/>)}
      {isDataDisplayed && (
        <p className="mt-4 font-janna min-h-1/6 max-h-4/5 md:min-h-1/12 md:max-h-2/5 w-3/4 md:w-1/3 xl:w-1/4 text-center align-middle text-base overflow-auto whitespace-pre-wrap md:text-lg fade-in">
          {data}
        </p>
      )}
      {userInfo.email && (
        <>
          <button
            className="absolute top-0 right-0 text-base md:text-2xl m-4 rounded-lg p-4 pr-6 md:pr-12"
            onClick={() => {setIsHistoryModalOpen(false); toggleMenuModal();}}
          >
             <IconContext.Provider
                value={{ color: '#ACB8A8', size: '48px'}}
              >
                <div>
                <IoEllipsisHorizontal />
                </div>
            </IconContext.Provider>
            
          </button>

          <MenuModal 
            isOpen={isMenuModalOpen}
            onRequestClose={toggleMenuModal}
            menuOptions={menuOptions}
          />
        </>
      )}
      <Modal
        isOpen={isHistoryModalOpen}
        onRequestClose={toggleHistoryModal}
        className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto mt-10"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end"
      >
        <MessageHistory messageHistory={messageHistory} credits={credits} />
      </Modal>
      <p className='text-xs text-janna absolute bottom-0 self-center text-center mb-4'>By talking to Tori, you are agreeing to our <a className="underline text-[#ACB8A8]"href="/legal">Terms</a>.</p>
    </div>
  );
}

export default Main;
