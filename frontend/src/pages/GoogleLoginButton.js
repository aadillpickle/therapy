// GoogleLogin.js
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import useUserInfo from '../useUserInfo';
import posthog from 'posthog-js';
import jwt_decode from "jwt-decode";

function GoogleLoginButton({styling}) {
  const [userInfo, setUserInfo] = useUserInfo('userInfo');

  const handleLoginSuccess = (response) => {
    console.log('Login success', response);
    const decodedEmail = jwt_decode(response.credential);
    setUserInfo({ email: decodedEmail.email });
    posthog.alias(decodedEmail.email);
    window.location.reload(false);
  };

  const handleLoginFailure = (response) => {
    console.log('Login failed', response);
  };


  return (
    <GoogleLogin
      className={styling}
      onSuccess={handleLoginSuccess}
      onError={handleLoginFailure}
    />
  );
}

export default GoogleLoginButton;
