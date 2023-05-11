import React, { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import useUserInfo from "../useUserInfo";

let stripePromise;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      `${process.env.REACT_APP_PUBLIC_STRIPE_PUBLISHABLE_KEY}`
    );
  }
  return stripePromise;
};

const Credits = () => {
  const [userInfo, setUserInfo] = useUserInfo("userInfo");

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
  return (
    <button
      className="text-white font-gilroy absolute top-0 right-0 text-xs md:text-lg m-4 border-2 border-slate-200 rounded-lg p-4"
      onClick={handleCheckout}
    >
      Buy credits
    </button>
  );
};
export default Credits;
