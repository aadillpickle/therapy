import { useState, useEffect } from 'react';

function useUserInfo(key) {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    function getUserInfoFromLocalStorage() {
      const storedUserInfo = window.localStorage.getItem(key);
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    }

    getUserInfoFromLocalStorage();
  }, [key]);

  function saveUserInfo(value) {
    setUserInfo(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  return [userInfo, saveUserInfo];
}

export default useUserInfo;
