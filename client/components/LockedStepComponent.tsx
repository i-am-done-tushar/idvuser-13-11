interface LockedStepComponentProps {
  message: string;
}

export function LockedStepComponent({ message }: LockedStepComponentProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 text-center px-4 py-8">
      {/* Folder Icon SVG */}
      <div className="flex flex-col items-center gap-2">
        <svg
          className="w-[270px] h-[124px] max-w-full"
          width="270"
          height="124"
          viewBox="0 0 270 124"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M85.3279 22.1817L78.0773 24.5986C77.434 24.813 77 25.4151 77 26.0933V64.3453C77 65.2155 77.7054 65.9209 78.5755 65.9209H191.227C192.097 65.9209 192.802 65.2155 192.802 64.3453V35.9856C194.546 23.1968 184.36 21.4894 177.822 22.3318C176.954 22.4437 176.115 21.8651 175.923 21.0114C169.802 -6.20549 153.204 2.6679 143.786 12.3146C142.867 13.2569 141.155 12.8031 140.472 11.6773C137.614 6.96655 131.053 8.36187 126.478 10.4315C125.425 10.908 124.154 10.2315 123.989 9.08721C122.429 -1.75121 117.469 0.119079 114.308 3.27733C113.684 3.9011 112.684 3.9987 111.958 3.49708C106.479 -0.288224 104.073 3.4716 103.285 7.11776C103.063 8.14607 101.996 8.83505 100.98 8.56145C89.6105 5.49927 86.5757 14.5459 86.4423 20.6214C86.4268 21.3237 85.9943 21.9596 85.3279 22.1817Z"
            fill="url(#paint0_linear_2641_15388)"
          />
          <rect
            x="123.5"
            y="46.3867"
            width="24.8794"
            height="12.8687"
            fill="url(#paint1_linear_2641_15388)"
          />
          <path
            d="M123.759 42.4412L116.105 52.7943C115.745 53.2812 115.989 53.9778 116.575 54.1334L120.155 55.085C120.486 55.173 120.837 55.0557 121.049 54.7866L125.516 49.1128C125.679 48.9062 125.927 48.7856 126.19 48.7856H145.088C145.402 48.7856 145.69 48.9567 145.841 49.2318L148.89 54.8064C149.034 55.0694 149.305 55.2383 149.604 55.2517L154.138 55.4557C154.81 55.4859 155.254 54.7672 154.926 54.1803L148.42 42.5328C148.268 42.2614 147.982 42.0933 147.671 42.0933H124.448C124.176 42.0933 123.92 42.2224 123.759 42.4412Z"
            fill="url(#paint2_linear_2641_15388)"
          />
          <path
            opacity="0.6"
            d="M157.998 75.1751H112.026C110.993 75.1751 110.448 73.9515 111.139 73.1837L114.18 69.8057H114.717H155.346C155.687 69.8057 156.012 69.9514 156.238 70.2061L158.89 73.1892C159.574 73.9586 159.027 75.1751 157.998 75.1751Z"
            fill="#EFF1F5"
          />
          <path
            d="M114.924 70.1123V53.812C114.924 52.8644 115.693 52.0962 116.64 52.0962H125.548C126.357 52.0962 127.056 52.6614 127.226 53.4525L127.931 56.7453C128.101 57.5364 128.8 58.1016 129.609 58.1016H141.747C142.601 58.1016 143.325 57.4737 143.446 56.6284L143.883 53.5694C144.004 52.7241 144.728 52.0962 145.581 52.0962H153.959C154.907 52.0962 155.675 52.8644 155.675 53.812V70.1123C155.675 71.0599 154.907 71.8281 153.959 71.8281H116.64C115.693 71.8281 114.924 71.0599 114.924 70.1123Z"
            fill="url(#paint3_linear_2641_15388)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_2641_15388"
              x1="135"
              y1="0.825195"
              x2="135.295"
              y2="33.9116"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#F1F1F1" />
              <stop offset="1" stopColor="#F8F8F8" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_2641_15388"
              x1="135.94"
              y1="46.3867"
              x2="135.94"
              y2="59.2554"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#BCD3FF" />
              <stop offset="1" stopColor="#EAF1FF" />
            </linearGradient>
            <linearGradient
              id="paint2_linear_2641_15388"
              x1="135.516"
              y1="49.8145"
              x2="135.516"
              y2="40.3774"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4372DF" />
              <stop offset="1" stopColor="#8EAFFE" />
            </linearGradient>
            <linearGradient
              id="paint3_linear_2641_15388"
              x1="135.514"
              y1="52.3911"
              x2="135.514"
              y2="72.123"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#84ABF8" />
              <stop offset="1" stopColor="#C1D4FC" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Message Text */}
        <div className="max-w-xs sm:max-w-sm md:max-w-md text-[#42526E] font-roboto text-[13px] font-medium leading-5 px-4">
          {message}
        </div>
      </div>
    </div>
  );
}
