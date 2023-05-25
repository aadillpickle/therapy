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
              <stop stop-color="#D8F0D0" />
              <stop
                offset="0.33"
                stop-color="#D0D8FC"
              />
              <stop offset="0.67" stop-color="#D0D8FC" />
              <stop
                offset="1"
                stop-color="#D8F0D0"
              />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
      
  }
  
  export default LoadingSpinner;  