import React, { useState, useRef, useEffect } from 'react';

const PlayAudioButton = ({ audio, hidden }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audio) {
      audioRef.current.src = audio;
    }
  }, [audio]);

  const handleButtonClick = () => {
    if (!audio) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <>
    {!hidden &&
      <div>
      
      <button
        onClick={handleButtonClick}
        className={`w-16 h-16 flex items-center justify-center rounded-md ${
          isPlaying ? 'bg-green-500' : 'bg-blue-500'
        }`}
      >
        <span className="material-icons">
          volume_up
        </span>
      </button>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
    </div>
    }
    </>
  );
};


export default PlayAudioButton;

