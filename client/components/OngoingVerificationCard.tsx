interface OngoingVerificationCardProps {
  title: string;
  documentType: string;
  progress: number;
  expiryDate: string;
}

const StatusBadge = () => {
  return (
    <div className="flex h-5 px-2 justify-center items-center gap-1 rounded-[20px] bg-[#F3E1B0]">
      <div className="w-2 h-2 rounded-full flex-shrink-0 bg-[#C98F20]" />
      <span className="font-roboto text-[13px] font-normal leading-5 text-[#402C1B]">
        In Progress
      </span>
    </div>
  );
};

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-start w-full">
        <span className="text-[#172B4D] font-roboto text-xs font-medium leading-3">
          Progress
        </span>
        <span className="text-[#172B4D] font-roboto text-xs font-medium leading-3">
          {progress}% Complete
        </span>
      </div>
      <div className="flex items-start gap-2 w-full rounded-xl bg-[#E9EDF3] h-2 overflow-hidden">
        {progress > 0 && (
          <div
            className="h-2 rounded-xl bg-[#0073EA]"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
    </div>
  );
};

export function OngoingVerificationCard({
  title,
  documentType,
  progress,
  expiryDate,
}: OngoingVerificationCardProps) {
  return (
    <div className="flex p-4 flex-col items-start gap-2 flex-1 rounded bg-white shadow-[0_3px_8px_0_rgba(0,0,0,0.20)] min-w-0">
      <div className="flex justify-between items-center w-full gap-2">
        <div className="flex items-start gap-0.5 min-w-0 flex-1">
          <h3 className="text-[#172B4D] text-center font-roboto text-xl font-bold leading-[30px] truncate">
            {title}
          </h3>
        </div>
        <StatusBadge />
      </div>

      <div className="flex items-center gap-0.5">
        <svg
          className="w-4 h-4 flex-shrink-0"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.33073 1.51562V4.26932C9.33073 4.64268 9.33073 4.82937 9.4034 4.97198C9.46733 5.09742 9.56926 5.1994 9.69473 5.26332C9.83733 5.33598 10.024 5.33598 10.3974 5.33598H13.1511M9.33073 11.3359H5.33073M10.6641 8.66927H5.33073M13.3307 6.66142V11.4693C13.3307 12.5894 13.3307 13.1494 13.1127 13.5773C12.921 13.9536 12.6151 14.2595 12.2387 14.4513C11.8109 14.6693 11.2509 14.6693 10.1307 14.6693H5.86406C4.74396 14.6693 4.1839 14.6693 3.75608 14.4513C3.37976 14.2595 3.0738 13.9536 2.88205 13.5773C2.66406 13.1494 2.66406 12.5894 2.66406 11.4693V4.53594C2.66406 3.41583 2.66406 2.85578 2.88205 2.42796C3.0738 2.05163 3.37976 1.74567 3.75608 1.55392C4.1839 1.33594 4.74396 1.33594 5.86406 1.33594H8.00526C8.4944 1.33594 8.739 1.33594 8.9692 1.3912C9.17326 1.44019 9.36833 1.521 9.54733 1.63066C9.74913 1.75434 9.92206 1.92729 10.268 2.2732L12.3935 4.39868C12.7394 4.74458 12.9123 4.91754 13.036 5.11937C13.1457 5.29831 13.2265 5.4934 13.2755 5.69747C13.3307 5.92765 13.3307 6.17224 13.3307 6.66142Z"
            stroke="#676879"
            strokeWidth="1.33333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
          {documentType}
        </span>
      </div>

      <ProgressBar progress={progress} />

      <div className="flex items-center gap-0.5">
        <svg
          className="w-4 h-4 flex-shrink-0"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 6.66146H2M10.6667 1.32812V3.99479M5.33333 1.32812V3.99479M5.2 14.6615H10.8C11.9201 14.6615 12.4801 14.6615 12.908 14.4435C13.2843 14.2517 13.5903 13.9458 13.782 13.5695C14 13.1416 14 12.5816 14 11.4615V5.86146C14 4.74135 14 4.1813 13.782 3.75348C13.5903 3.37715 13.2843 3.07119 12.908 2.87944C12.4801 2.66146 11.9201 2.66146 10.8 2.66146H5.2C4.07989 2.66146 3.51984 2.66146 3.09202 2.87944C2.71569 3.07119 2.40973 3.37715 2.21799 3.75348C2 4.1813 2 4.74135 2 5.86146V11.4615C2 12.5816 2 13.1416 2.21799 13.5695C2.40973 13.9458 2.71569 14.2517 3.09202 14.4435C3.51984 14.6615 4.07989 14.6615 5.2 14.6615Z"
            stroke="#676879"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[#505258] font-roboto text-[13px] font-normal leading-5">
          Expires on {expiryDate}
        </span>
      </div>
    </div>
  );
}
