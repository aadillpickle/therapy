import React, { useState, useEffect } from 'react';

const VoiceRecorderButton = ({ onTranscribe }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        console.log(event);

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
          onTranscribe(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
      };

      setSpeechRecognition(recognition);
  }, []);

  const handleButtonClick = () => {
    if (speechRecognition) {
      if (isRecording) {
        speechRecognition.stop();
      } else {
        speechRecognition.start();
      }

      setIsRecording(!isRecording);
    }
  };

  return (
    <button
      onClick={handleButtonClick}
      className={`flex items-center justify-center text-white px-4 py-2 rounded-lg focus:outline-none transition-colors ${
        isRecording ? 'bg-green-400' : 'bg-red-600'
      }`}
    >
      <span className="material-icons">
        {isRecording ? 'mic' : 'mic_off'}
      </span>
    </button>
  );
};

export default VoiceRecorderButton;
