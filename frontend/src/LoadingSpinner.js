function LoadingSpinner() {

return(
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
            <stop stop-color="#1A5EFF" />
            <stop
              offset="0.192708"
              stop-color="#1A5EFF"
              stop-opacity="0.65625"
            />
            <stop offset="0.515625" stop-color="#F96AFA" />
            <stop
              offset="0.770833"
              stop-color="#F96AFA"
              stop-opacity="0.99"
            />
            <stop offset="0.953125" stop-color="#F96AFA" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
)
    
}

export default LoadingSpinner;