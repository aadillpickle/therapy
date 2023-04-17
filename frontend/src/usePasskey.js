import { useState, useEffect } from 'react';

function usePasskey(key) {
  const [passkey, setPasskey] = useState('');

  useEffect(() => {
    async function getPasskeyFromLocalStorage() {
      const storedPasskey = await getPasskey();
      if (storedPasskey) {
        setPasskey(storedPasskey);
      }
    }

    async function getPasskey() {
      return Promise.resolve(window.localStorage.getItem(key));
    }

    getPasskeyFromLocalStorage();
  }, [key]);

  function savePasskey(value) {
    setPasskey(value);
    window.localStorage.setItem(key, value);
  }

  return [passkey, savePasskey];
}

export default usePasskey;
