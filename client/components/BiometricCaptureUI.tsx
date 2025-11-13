interface BiometricCaptureUIProps {
  onScanFace: () => void;
}

export function BiometricCaptureUI({ onScanFace }: BiometricCaptureUIProps) {
  return (
    <div className="flex w-full flex-col gap-4 rounded bg-white">
      {/* Header Section */}
      <div className="flex flex-col items-start self-stretch rounded border border-[#DEDEDD]">
        <div className="flex flex-col justify-center items-center gap-2 self-stretch bg-white px-3 py-4">
          <div className="flex items-center gap-2 self-stretch pb-1">
            <svg
              width="19"
              height="19"
              viewBox="0 0 19 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[19px] h-[19px]"
            >
              <path
                d="M6.30071 9.44844H12.6001M17.3246 9.44844C17.3246 13.7972 13.7992 17.3227 9.4504 17.3227C5.10158 17.3227 1.57617 13.7972 1.57617 9.44844C1.57617 5.09963 5.10158 1.57422 9.4504 1.57422C13.7992 1.57422 17.3246 5.09963 17.3246 9.44844Z"
                stroke="#323238"
                strokeWidth="1.57484"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-[#172B4D] font-roboto text-[17px] font-bold leading-[12.6px]">
              Biometric Capture
            </div>
          </div>
          <div className="flex justify-center items-center gap-2.5 self-stretch pl-[29px]">
            <div className="flex-1 text-[#172B4D] font-roboto text-[14px] font-normal leading-[21px]">
              Take a live selfie to confirm you are the person in the ID
              document. Make sure you're in a well-lit area and your face is
              clearly visible.
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex w-full flex-col justify-center items-center border-t border-[#DEDEDD] bg-white p-4">
          <div className="flex w-full justify-center items-center gap-6 p-2">
            {/* Left Side - Illustration */}
            <div className="flex w-[460px] h-[460px] pt-10 flex-col justify-between items-center flex-shrink-0 rounded-lg bg-white">
              <style>
                {`
                  @keyframes headTilt {
                    0%, 100% {
                      transform: rotate(0deg);
                    }
                    50% {
                      transform: rotate(-8deg);
                    }
                  }
                  .animated-head {
                    animation: headTilt 2s ease-in-out infinite;
                    transform-origin: center;
                  }
                `}
              </style>
              <svg
                className="flex flex-col items-center gap-3 self-stretch"
                width="460"
                height="353"
                viewBox="0 0 460 353"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g className="animated-head">
                  <path
                    d="M232.04 131.449C232.04 131.449 226.213 140.607 251.187 163.917C276.162 187.226 265.34 233.013 265.34 233.013L193.746 174.739L191.248 123.957L232.04 131.449Z"
                    fill="#2E1500"
                  />
                  <path
                    d="M203.318 166.413V136.776C203.318 135.777 203.901 134.862 204.9 134.445C207.48 133.446 213.308 132.198 221.633 135.195C233.038 139.274 239.698 131.365 243.86 105.142C244.027 104.226 244.693 103.393 245.608 103.144L252.685 101.146C254.266 100.729 254.932 98.898 254.1 97.4828L246.607 84.9954C246.108 84.1629 246.108 83.0807 246.774 82.2482L247.939 80.6665C248.189 80.4167 248.272 80.0837 248.356 79.6675C249.438 74.5893 257.18 35.4623 241.612 26.8876C226.295 18.4795 175.679 31.8826 167.771 34.047C167.105 34.2135 166.522 34.713 166.189 35.2958L143.628 80.5C143.462 80.833 143.379 81.166 143.379 81.499L141.797 118.711C141.797 119.128 141.88 119.461 142.047 119.794L157.947 155.757C158.197 156.423 158.78 156.923 159.446 157.089L200.404 170.242C202.319 170.825 204.15 168.994 203.484 167.079C203.401 166.912 203.318 166.663 203.318 166.413Z"
                    fill="#EAC6D0"
                  />
                  <path
                    d="M338.598 141.439C338.598 141.439 333.603 135.612 330.273 138.942C326.943 142.272 329.441 148.682 334.852 152.178C340.263 155.592 338.598 141.439 338.598 141.439Z"
                    fill="#C6A6B1"
                  />
                  <path
                    d="M338.764 140.607C338.764 140.607 331.854 132.948 337.349 130.201C342.927 127.454 347.755 134.363 347.755 137.86C347.755 141.273 338.764 140.607 338.764 140.607Z"
                    fill="#C6A6B1"
                  />
                  <path
                    d="M188.333 89.4075C188.333 89.4075 191.663 86.0775 190.831 70.2602C190.831 70.2602 234.12 70.2602 238.283 32.7982C238.283 32.7982 251.603 43.6205 246.608 80.2501H248.273C248.273 80.2501 266.588 35.2956 234.953 16.9809C203.318 -1.33391 166.689 11.9859 157.531 18.6458C157.531 18.6458 128.394 34.4632 130.892 74.4227C130.892 74.4227 135.054 132.697 118.404 155.174C118.404 155.174 137.552 141.854 170.851 156.839V156.007C170.851 156.007 179.176 125.205 172.516 98.5649C172.516 98.5649 154.201 94.4024 160.861 73.5902C160.861 73.5902 164.191 62.7678 175.014 65.2653C175.014 65.2653 170.851 81.9151 188.333 89.4075Z"
                    fill="#2E1500"
                  />
                  <path
                    d="M331.106 163.083C331.106 163.083 323.613 161.418 321.948 166.413C320.283 171.408 329.441 172.24 329.441 172.24L331.106 163.083Z"
                    fill="#C6A6B1"
                  />
                  <path
                    d="M334.52 153.178C334.52 153.178 326.361 147.683 323.614 153.095C320.284 159.754 331.939 162.252 331.939 162.252L334.52 153.178Z"
                    fill="#C6A6B1"
                  />
                  <path
                    d="M342.677 141.44L339.514 140.275C338.848 140.025 338.515 139.359 338.765 138.693L358.078 84.6642C358.328 83.9982 358.994 83.6652 359.66 83.915L362.824 85.0804C363.49 85.3302 363.822 85.9962 363.573 86.6622L344.259 140.691C344.092 141.357 343.343 141.69 342.677 141.44Z"
                    fill="#2D2628"
                  />
                  <path
                    d="M298.306 232.764L318.618 208.039C318.618 208.039 312.791 189.724 321.948 178.902C321.948 178.902 334.436 158.922 338.598 138.942C338.598 138.942 341.096 133.115 347.755 134.78C354.415 136.445 353.583 142.272 353.583 142.272L357.745 163.084C357.745 163.084 359.41 172.242 357.745 177.237C356.08 182.232 346.923 209.704 346.923 209.704L326.277 245.085L324.446 246.333L295.309 234.678L298.306 232.764Z"
                    fill="#EAC6D0"
                  />
                  <path
                    d="M347.756 166.413C347.756 166.413 352.751 168.078 351.086 155.591L351.918 139.773C351.918 139.773 345.258 160.586 347.756 166.413Z"
                    fill="#CFABB5"
                  />
                </g>
                <path
                  d="M96.3438 258.822L97.1762 195.552C97.1762 195.552 98.5082 155.843 132.391 149.849C166.273 143.855 257.847 178.07 266.172 228.019C266.172 228.019 272.832 246.334 271.167 253.827L291.979 228.852L326.943 244.669L318.619 260.487L96.3438 258.822Z"
                  fill="#59A4F0"
                />
                <path
                  d="M275.838 68.5959L304.143 68.1797L290.656 82.0823L275.838 68.5959Z"
                  fill="#59A4F0"
                />
                <path
                  d="M295.32 69.2632L285.33 68.6804C287.661 27.1392 264.185 8.74114 263.186 7.9919L269.179 0C270.345 0.915739 297.9 22.1442 295.32 69.2632Z"
                  fill="#59A4F0"
                />
                <text
                  fill="#222121"
                  xmlSpace="preserve"
                  style={{ whiteSpace: "pre" }}
                  fontFamily="Roboto"
                  fontSize="18"
                  fontWeight="bold"
                  letterSpacing="0em"
                >
                  <tspan x="156.594" y="290.641">
                    Look up and down
                  </tspan>
                </text>
                <text
                  fill="#5F5555"
                  xmlSpace="preserve"
                  style={{ whiteSpace: "pre" }}
                  fontFamily="Roboto"
                  fontSize="13"
                  fontWeight="500"
                  letterSpacing="0em"
                >
                  <tspan x="90.5039" y="320.932">
                    Maintain your position in the frame as you move{" "}
                  </tspan>
                  <tspan x="146.719" y="344.932">
                    your head up, and then down
                  </tspan>
                </text>
              </svg>

              {/* Button Footer */}
              <div className="flex px-4 py-2 flex-col items-end gap-2 self-stretch rounded-b bg-[#F6F7FB]">
                <button
                  onClick={onScanFace}
                  className="flex h-[34px] px-3 py-2 justify-center items-center gap-2 rounded bg-[#0073EA] text-white font-roboto text-[14px] font-medium hover:bg-[#0060C0] transition-colors"
                >
                  Scan Your Face
                </button>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="flex flex-col justify-center items-center gap-1 h-[100px]">
              <div className="h-[36px] w-px bg-[#D0D4E4]"></div>
              <div className="text-[#676879] font-roboto text-[13.6px]">or</div>
              <div className="h-[36px] w-px bg-[#D0D4E4]"></div>
            </div>

            {/* Right Side - QR Code */}
            <div className="flex h-[449px] flex-col justify-center items-start flex-1">
              <div className="flex h-[399px] flex-col items-center gap-2 flex-shrink-0 self-stretch">
                <div className="flex pt-4 flex-col justify-between items-center flex-1 self-stretch rounded-t-lg border-[1.575px] border-dashed border-[#C3C6D4]">
                  <div className="flex flex-col justify-center items-center gap-2 flex-1">
                    <div className="flex justify-center items-center gap-4">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=134x138&data=https://id.xyz/verify"
                        alt="QR Code"
                        className="w-[134px] h-[138px]"
                      />
                      <div className="flex flex-col justify-center items-center gap-2">
                        <div className="flex w-[225px] flex-col items-center gap-3">
                          <div className="flex w-[225px] flex-col items-start">
                            <div className="self-stretch text-center font-roboto text-[14px] font-normal leading-[21px]">
                              <span className="text-[#676879]">
                                Continue on another device by scanning the QR
                                code or opening
                              </span>
                              <span className="text-[#0073EA]">
                                {" "}
                                https://id.xyz/verify
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-[462px] h-[50px] px-4 py-4 items-center gap-2 flex-shrink-0 rounded-b bg-[#F6F7FB]">
                <div className="flex w-[142px] justify-end items-center gap-1 flex-shrink-0">
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 21 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[21px] h-[21px] flex-shrink-0"
                  >
                    <g clipPath="url(#clip0_7664_76472)">
                      <path
                        d="M10.4991 13.9988V10.4991M10.4991 6.99948H10.5079M19.2483 10.4991C19.2483 15.3311 15.3311 19.2483 10.4991 19.2483C5.66712 19.2483 1.75 15.3311 1.75 10.4991C1.75 5.66712 5.66712 1.75 10.4991 1.75C15.3311 1.75 19.2483 5.66712 19.2483 10.4991Z"
                        stroke="#0073EA"
                        strokeWidth="1.57484"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_7664_76472">
                        <rect width="20.9979" height="20.9979" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <div className="text-[#0073EA] font-roboto text-[13px] font-normal leading-[21px]">
                    How does this work?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
