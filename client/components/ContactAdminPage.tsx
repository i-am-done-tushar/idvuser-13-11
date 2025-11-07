import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function ContactAdminPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("contact");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState(""); // html
  const [plainText, setPlainText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const colorRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // keep message/plainText in sync if programmatically changed
    if (
      editorRef.current &&
      message &&
      editorRef.current.innerHTML !== message
    ) {
      editorRef.current.innerHTML = message;
      setPlainText(editorRef.current.innerText || "");
    }
  }, [message]);

  const exec = (command: string, value?: string) => {
    try {
      document.execCommand(command, false, value || undefined);
      // update state
      const html = editorRef.current?.innerHTML || "";
      const text = editorRef.current?.innerText || "";
      setMessage(html);
      setPlainText(text);
      // keep focus on editor
      editorRef.current?.focus();
    } catch (err) {
      // ignore
    }
  };

  const insertInlineCode = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const selected = range.toString();
    const codeHtml = `<code style="background:#f6f8fa;padding:2px 4px;border-radius:4px;font-family:monospace">${selected}</code>`;
    document.execCommand("insertHTML", false, codeHtml);
    const html = editorRef.current?.innerHTML || "";
    const text = editorRef.current?.innerText || "";
    setMessage(html);
    setPlainText(text);
    editorRef.current?.focus();
  };

  // toolbar active states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [isJustifyLeft, setIsJustifyLeft] = useState(false);
  const [currentColor, setCurrentColor] = useState<string | null>(null);

  const updateToolbarState = () => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode || !editorRef.current.contains(sel.anchorNode)) {
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setIsStrike(false);
      setIsJustifyLeft(false);
      setCurrentColor(null);
      return;
    }
    try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
      setIsStrike(document.queryCommandState('strikeThrough'));
      setIsJustifyLeft(document.queryCommandState('justifyLeft'));
      const col = document.queryCommandValue('foreColor');
      setCurrentColor(col || null);
    } catch (err) {}
  };

  useEffect(() => {
    document.addEventListener('selectionchange', updateToolbarState);
    return () => document.removeEventListener('selectionchange', updateToolbarState);
  }, []);

  const execWithUpdate = (command: string, value?: string) => {
    exec(command, value);
    setTimeout(updateToolbarState, 0);
  };

  const insertInlineCodeWithUpdate = () => {
    insertInlineCode();
    setTimeout(updateToolbarState, 0);
  };

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: (isActive: boolean) => (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.56194 1.11261C9.84719 1.03538 10.1479 1.03538 10.4331 1.11261C10.7642 1.20227 11.043 1.42115 11.2655 1.59584C13.185 3.10283 15.1164 4.59457 17.0444 6.09074C17.3583 6.33431 17.6348 6.5489 17.8408 6.82749C18.0216 7.07197 18.1564 7.3474 18.2383 7.64023C18.3317 7.97391 18.3314 8.32392 18.3309 8.72123C18.3288 10.769 18.3309 12.8167 18.3309 14.8645C18.3309 15.3037 18.3309 15.6826 18.3054 15.9948C18.2784 16.3243 18.219 16.652 18.0584 16.9673C17.8187 17.4376 17.4362 17.8201 16.9659 18.0598C16.6505 18.2205 16.3229 18.2799 15.9934 18.3068C15.3254 18.3614 14.6479 18.332 13.9782 18.3323C13.8789 18.3323 13.7604 18.3324 13.656 18.3239C13.5349 18.314 13.3616 18.2886 13.18 18.1961C12.9449 18.0762 12.7536 17.885 12.6338 17.6498C12.5412 17.4681 12.5159 17.2948 12.5059 17.1738C12.4974 17.0694 12.4974 16.9508 12.4975 16.8516L12.5041 12.1881C12.5048 11.7207 12.505 11.4871 12.4144 11.3086C12.3345 11.1516 12.207 11.0238 12.0501 10.9438C11.8717 10.8528 11.638 10.8528 11.1708 10.8528H8.83752C8.37144 10.8528 8.13836 10.8528 7.96023 10.9435C7.80354 11.0232 7.67609 11.1505 7.59611 11.3071C7.50519 11.4851 7.50485 11.7181 7.50419 12.1842L7.49751 16.8516C7.49755 16.9508 7.4976 17.0694 7.48906 17.1738C7.47918 17.2948 7.45381 17.4681 7.36127 17.6498C7.24143 17.885 7.0502 18.0762 6.815 18.1961C6.63338 18.2886 6.46005 18.314 6.33904 18.3239C6.2346 18.3324 6.11606 18.3323 6.0168 18.3323C5.34706 18.332 4.66959 18.3614 4.00165 18.3068C3.6722 18.2799 3.34452 18.2205 3.0292 18.0598C2.5588 17.8201 2.17635 17.4376 1.93666 16.9673C1.77605 16.652 1.71661 16.3243 1.68963 15.9948C1.66406 15.6826 1.66406 15.3037 1.66406 14.8645C1.66406 12.8167 1.66627 10.769 1.66406 8.72123C1.66359 8.32392 1.66333 7.97391 1.75672 7.64023C1.83866 7.3474 1.97345 7.07197 2.15419 6.82749C2.36025 6.5489 2.63674 6.33431 2.95063 6.09074C4.87865 4.59457 6.81004 3.10283 8.72954 1.59584C8.95201 1.42115 9.23079 1.20227 9.56194 1.11261Z"
            fill={isActive ? "#0073EA" : "#676879"}
          />
        </svg>
      ),
      onClick: () => navigate("/dashboard"),
    },
    {
      id: "ongoing",
      label: "Ongoing Verification",
      icon: (isActive: boolean) => (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.9167 9.58333L17.2504 11.25L15.5833 9.58333M17.4543 10.8333C17.4845 10.5597 17.5 10.2817 17.5 10C17.5 5.85787 14.1422 2.5 10 2.5C5.85787 2.5 2.5 5.85787 2.5 10C2.5 14.1422 5.85787 17.5 10 17.5C12.3561 17.5 14.4583 16.4136 15.8333 14.7144M10 5.83333V10L12.5 11.6667"
            stroke={isActive ? "#0073EA" : "#676879"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => navigate("/ongoing-verification"),
    },
    {
      id: "expired",
      label: "Expired Verification",
      icon: (isActive: boolean) => (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_11001_26397)">
            <path
              d="M12.5052 7.50521L7.50521 12.5052M7.50521 7.50521L12.5052 12.5052M18.3385 10.0052C18.3385 14.6075 14.6075 18.3385 10.0052 18.3385C5.40283 18.3385 1.67188 14.6075 1.67188 10.0052C1.67188 5.40283 5.40283 1.67188 10.0052 1.67188C14.6075 1.67188 18.3385 5.40283 18.3385 10.0052Z"
              stroke={isActive ? "#0073EA" : "#676879"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_11001_26397">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      onClick: () => navigate("/expired-verification"),
    },
    {
      id: "verified",
      label: "Verified Credentials",
      icon: (isActive: boolean) => (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 9.16667L10 11.6667L18.3333 3.33333M13.3333 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86503 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86503C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9002 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86503 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H13.5C14.9002 17.5 15.6002 17.5 16.135 17.2275C16.6054 16.9878 16.9878 16.6054 17.2275 16.135C17.5 15.6002 17.5 14.9002 17.5 13.5V10"
            stroke={isActive ? "#0073EA" : "#676879"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      onClick: () => navigate("/verified-credentials"),
    },
    {
      id: "contact",
      label: "Contact Admin",
      icon: (isActive: boolean) => (
        <svg
          className="w-5 h-5"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.32195 12.0938C9.10747 12.0942 10.8931 12.0942 12.6786 12.0938C13.2841 12.0936 13.6968 12.0935 14.0571 12.1571C15.7822 12.4613 17.1328 13.8118 17.437 15.5369C17.5005 15.8973 17.5004 16.3098 17.5003 16.9154C17.5002 17.0474 17.5043 17.1803 17.4813 17.3108C17.3901 17.8283 16.9848 18.2335 16.4673 18.3248C16.3539 18.3448 16.2343 18.3442 16.1748 18.3438C12.0589 18.3218 7.94165 18.3218 3.8257 18.3438C3.76623 18.3442 3.64668 18.3448 3.5332 18.3248C3.0157 18.2335 2.61051 17.8283 2.51925 17.3108C2.49624 17.1803 2.50029 17.0474 2.50025 16.9154C2.50012 16.3098 2.50003 15.8973 2.56357 15.5369C2.86775 13.8118 4.21835 12.4613 5.9434 12.1571C6.30374 12.0935 6.71638 12.0936 7.32195 12.0938Z"
            fill={isActive ? "#0073EA" : "#676879"}
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.42188 6.23958C5.42188 3.70828 7.4739 1.65625 10.0052 1.65625C12.5365 1.65625 14.5886 3.70828 14.5886 6.23958C14.5886 8.77092 12.5365 10.8229 10.0052 10.8229C7.4739 10.8229 5.42188 8.77092 5.42188 6.23958Z"
            fill={isActive ? "#0073EA" : "#676879"}
          />
        </svg>
      ),
      onClick: () => navigate("/contact-admin"),
    },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !plainText.trim()) return;

    setSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 600));

      toast({
        title: "Message sent successfully",
        description: "Admin will respond shortly.",
      });

      setSubject("");
      setMessage("");
      setPlainText("");
      if (editorRef.current) editorRef.current.innerHTML = "";
      setFile(null);
    } catch (err) {
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      <div className="flex w-full h-11 px-3 lg:px-4 justify-between items-center border-b border-[#DEDEDD] bg-white">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/4566b1e4f2b69299156b1f1c61472e06e0ad9666?width=180"
          alt="Logo"
          className="w-[90px] h-7 object-contain"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/profile")}
            className="flex w-8 h-8 p-2 justify-center items-center gap-2 rounded-full bg-[#F65F7C]"
          >
            <span className="text-white font-roboto text-xs font-medium leading-[10px]">
              OS
            </span>
          </button>
        </div>
      </div>

      <div className="flex h-full bg-white overflow-hidden">
        <div className="flex w-[248px] px-2 py-2 flex-col items-start gap-1 border-r border-[#D0D4E4] bg-white overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  item.onClick();
                }}
                className={`flex h-[38px] items-center gap-2 self-stretch rounded ${
                  isActive ? "bg-[#E6F1FD] pl-1 pr-2.25" : "pl-3 pr-2.25"
                }`}
              >
                {isActive && (
                  <svg
                    className="w-0.5 h-[28.5px]"
                    width="2"
                    height="31"
                    viewBox="0 0 2 31"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1V29.5"
                      stroke="#0073EA"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {item.icon(isActive)}
                <span
                  className={`font-roboto text-[13px] font-medium leading-normal ${
                    isActive ? "text-[#172B4D]" : "text-[#505258]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col items-start bg-white overflow-y-auto">
          <div className="flex h-14 flex-col items-start self-stretch border-b border-[#DEDEDD]">
            <div className="flex px-4 py-2 items-center gap-2 flex-1 self-stretch">
              <div className="flex items-start gap-2">
                <h1 className="text-[#172B4D] font-roboto text-xl font-bold leading-[30px]">
                  Contact Admin
                </h1>
                <svg
                  className="w-5 h-5"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_contact_info)">
                    <path
                      d="M9.9974 13.3307V9.9974M9.9974 6.66406H10.0057M18.3307 9.9974C18.3307 14.5997 14.5997 18.3307 9.9974 18.3307C5.39502 18.3307 1.66406 14.5997 1.66406 9.9974C1.66406 5.39502 5.39502 1.66406 9.9974 1.66406C14.5997 1.66406 18.3307 5.39502 18.3307 9.9974Z"
                      stroke="#505258"
                      strokeWidth="1.66667"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_contact_info">
                      <rect width="20" height="20" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          <div className="flex px-4 py-[18px] flex-col items-end gap-1 flex-1 self-stretch">
            <form onSubmit={handleSubmit} className="w-full max-w-[993px]">
              <div className="flex flex-col items-start gap-4 rounded border border-[#DEDEDD] bg-white p-4 shadow-[0_3px_8px_0_rgba(0,0,0,0.20)]">
                <div className="flex flex-col items-start self-stretch">
                  <label className="flex pb-2 items-start gap-2 self-stretch">
                    <span className="flex h-[10px] flex-col justify-center flex-1 text-[#172B4D] font-roboto text-[13px] font-medium leading-[18px]">
                      Subject Line
                    </span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Eg. Question about document submission"
                    className="flex h-[38px] px-3 py-[15px] justify-between items-center self-stretch rounded border border-[#C3C6D4] bg-white text-[#676879] font-roboto text-[13px] font-normal leading-5 outline-none focus:border-[#0073EA]"
                    required
                  />
                </div>

                <div className="flex flex-col items-start self-stretch">
                  <label className="flex pb-2 items-start gap-2 self-stretch">
                    <span className="flex h-[10px] flex-col justify-center flex-1 text-[#172B4D] font-roboto text-[13px] font-medium leading-[18px]">
                      Message
                    </span>
                  </label>

                  <div className="w-full rounded border border-[#C3C6D4] bg-white overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center gap-2 px-2 py-1 border-b border-[#C3C6D4] bg-white">
                      <button
                        type="button"
                        onClick={() => execWithUpdate("undo")}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.5 6.25H4.88438L7.12625 4.00875L6.25 3.125L2.5 6.875L6.25 10.625L7.12625 9.74062L4.88625 7.5H12.5C13.4946 7.5 14.4484 7.89509 15.1517 8.59835C15.8549 9.30161 16.25 10.2554 16.25 11.25C16.25 12.2446 15.8549 13.1984 15.1517 13.9017C14.4484 14.6049 13.4946 15 12.5 15H7.5V16.25H12.5C13.8261 16.25 15.0979 15.7232 16.0355 14.7855C16.9732 13.8479 17.5 12.5761 17.5 11.25C17.5 9.92392 16.9732 8.65215 16.0355 7.71447C15.0979 6.77678 13.8261 6.25 12.5 6.25Z"
                            fill="#212529"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => execWithUpdate("redo")}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.5 6.25H15.1156L12.8737 4.00875L13.75 3.125L17.5 6.875L13.75 10.625L12.8737 9.74062L15.1137 7.5H7.5C6.50544 7.5 5.55161 7.89509 4.84835 8.59835C4.14509 9.30161 3.75 10.2554 3.75 11.25C3.75 12.2446 4.14509 13.1984 4.84835 13.9017C5.55161 14.6049 6.50544 15 7.5 15H12.5V16.25H7.5C6.17392 16.25 4.90215 15.7232 3.96447 14.7855C3.02678 13.8479 2.5 12.5761 2.5 11.25C2.5 9.92392 3.02678 8.65215 3.96447 7.71447C4.90215 6.77678 6.17392 6.25 7.5 6.25Z"
                            fill="#212529"
                          />
                        </svg>
                      </button>

                      <div className="h-8 px-2 flex items-center rounded text-sm bg-white border border-transparent">
                        <span className="text-sm text-[#212529]">
                          Normal text
                        </span>
                      </div>

                      <div className="w-px h-6 bg-[#E9ECEF] mx-1" />

                      <button
                        type="button"
                        onClick={() => execWithUpdate("justifyLeft")}
                        className={`p-1 rounded hover:bg-gray-100 ${isJustifyLeft ? "bg-[#E6F1FD]" : ""}`}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.5 3.75H16.25V5H7.5V3.75ZM7.5 7.5H13.75V8.75H7.5V7.5ZM7.5 11.25H16.25V12.5H7.5V11.25ZM7.5 15H13.75V16.25H7.5V15ZM3.75 2.5H5V17.5H3.75V2.5Z"
                            fill="#212529"
                          />
                        </svg>
                      </button>

                      <input
                        ref={colorRef}
                        type="color"
                        className="hidden"
                        onChange={(e) => execWithUpdate("foreColor", e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => colorRef.current?.click()}
                        className={`p-1 rounded hover:bg-gray-100 ${currentColor ? "bg-[#E6F1FD]" : ""}`}
                      >
                        <div className="w-4 h-4 rounded-sm" style={{ background: currentColor || '#212529' }} />
                      </button>

                      <div className="ml-2 w-px h-6 bg-[#E9ECEF] mr-1" />

                      <button
                        type="button"
                        onClick={() => execWithUpdate("bold")}
                        className={`p-1 rounded hover:bg-gray-100 font-bold ${isBold ? "bg-[#E6F1FD]" : ""}`}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.4062 15.625H5.625V4.375H10.9375C11.5639 4.37504 12.1771 4.55435 12.7048 4.89174C13.2325 5.22914 13.6526 5.71052 13.9155 6.27903C14.1784 6.84754 14.2731 7.47942 14.1884 8.10001C14.1037 8.72061 13.8431 9.30399 13.4375 9.78125C13.9673 10.205 14.3528 10.7825 14.5408 11.4344C14.7289 12.0862 14.7102 12.7803 14.4875 13.4211C14.2647 14.0619 13.8488 14.6179 13.297 15.0126C12.7452 15.4073 12.0847 15.6213 11.4062 15.625Z"
                            fill="#212529"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => execWithUpdate("italic")}
                        className={`p-1 rounded hover:bg-gray-100 italic ${isItalic ? "bg-[#E6F1FD]" : ""}`}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15.625 5.625V4.375H7.5V5.625H10.7125L7.98125 14.375H4.375V15.625H12.5V14.375H9.2875L12.0187 5.625H15.625Z"
                            fill="#212529"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => execWithUpdate("underline")}
                        className={`p-1 rounded hover:bg-gray-100 ${isUnderline ? "bg-[#E6F1FD]" : ""}`}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M2.5 16.25H17.5V17.5H2.5V16.25ZM10 14.375C8.83968 14.375 7.72688 13.9141 6.90641 13.0936C6.08594 12.2731 5.625 11.1603 5.625 10V3.125H6.875V10C6.875 10.8288 7.20424 11.6237 7.79029 12.2097C8.37634 12.7958 9.1712 13.125 10 13.125C10.8288 13.125 11.6237 12.7958 12.2097 12.2097C12.7958 11.6237 13.125 10.8288 13.125 10V3.125H14.375V10C14.375 11.1603 13.9141 12.2731 13.0936 13.0936C12.2731 13.9141 11.1603 14.375 10 14.375Z"
                            fill="#212529"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => execWithUpdate("strikeThrough")}
                        className="p-1 rounded hover:bg-gray-100 line-through"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17.5 9.37538H11.2225C10.945 9.30076 10.6662 9.23096 10.3863 9.16601C8.63125 8.75101 7.63875 8.44726 7.63875 7.02663C7.6245 6.78139 7.66081 6.53584 7.74542 6.30522C7.83004 6.0746 7.96115 5.86384 8.13062 5.68601C8.6615 5.24944 9.32644 5.00889 10.0137 5.00476C11.7825 4.96101 12.5981 5.56101 13.265 6.47351L14.2744 5.73601C13.8019 5.05748 13.1578 4.51654 12.4078 4.16845C11.6578 3.82036 10.8288 3.6776 10.0056 3.75476C8.99439 3.76121 8.01887 4.12947 7.25563 4.79288C6.96634 5.08632 6.74024 5.4359 6.59125 5.82008C6.44227 6.20426 6.37356 6.61488 6.38937 7.02663C6.36197 7.47718 6.4466 7.92751 6.63572 8.33737C6.82483 8.74723 7.11254 9.10385 7.47312 9.37538H2.5V10.6254H11.0325C12.2619 10.9816 12.9969 11.4454 13.0156 12.7241C13.0359 12.9973 12.9985 13.2717 12.9056 13.5294C12.8128 13.7871 12.6667 14.0223 12.4769 14.2198C11.8155 14.7411 10.9938 15.017 10.1519 15.0004C9.52345 14.9822 8.90738 14.8213 8.35029 14.5299C7.7932 14.2385 7.30966 13.8243 6.93625 13.3185L5.97812 14.121C6.46358 14.768 7.08994 15.2959 7.80972 15.6648C8.52951 16.0338 9.32384 16.234 10.1325 16.2504H10.195C11.3492 16.2636 12.4695 15.86 13.35 15.1135C13.6625 14.7984 13.9054 14.4213 14.0632 14.0065C14.2209 13.5917 14.2898 13.1485 14.2656 12.7054C14.289 11.9474 14.0332 11.2072 13.5469 10.6254H17.5V9.37538Z"
                            fill="#212529"
                          />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => insertInlineCode()}
                        className="p-1 rounded hover:bg-gray-100"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19.375 10L15 14.375L14.1187 13.4938L17.6063 10L14.1187 6.50625L15 5.625L19.375 10ZM0.625 10L5 5.625L5.88125 6.50625L2.39375 10L5.88125 13.4938L5 14.375L0.625 10Z"
                            fill="#212529"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="relative w-full">
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={() => {
                          const html = editorRef.current?.innerHTML || "";
                          const text = editorRef.current?.innerText || "";
                          setMessage(html);
                          setPlainText(text);
                        }}
                        className="w-full min-h-[202px] p-3 text-[#676879] font-roboto text-[13px] font-normal leading-5 outline-none resize-none"
                        aria-multiline
                      />

                      {!plainText && (
                        <div className="pointer-events-none absolute top-3 left-3 text-[#9aa0a6]">
                          Describe your question or concern in detail....
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start self-stretch">
                  <label className="flex pb-2 items-start gap-2 self-stretch">
                    <span className="flex h-[10px] flex-col justify-center flex-1 text-[#172B4D] font-roboto text-[13px] font-medium leading-[18px]">
                      Attachment (Optional)
                    </span>
                  </label>
                  <div
                    className={`flex h-[72px] px-[284px] justify-center items-center gap-2 self-stretch rounded-lg border border-dashed ${
                      dragActive
                        ? "border-[#0073EA] bg-[#E6F1FD]"
                        : "border-[#C3C6D4] bg-white"
                    } cursor-pointer relative`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".jpg,.jpeg,.png,.svg,.xls,.xlsx"
                    />
                    <div className="flex items-center gap-2 pointer-events-none">
                      <div className="relative w-[33px] h-[34px]">
                        <svg
                          className="absolute left-0 top-0"
                          width="28"
                          height="28"
                          viewBox="0 0 29 29"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.3433 2.3039C15.3446 2.33205 15.3446 2.34758 15.3446 2.37864V7.59236C15.3446 7.89031 15.3445 8.18048 15.3647 8.42622C15.3866 8.69608 15.4387 9.01453 15.602 9.33495C15.8283 9.77923 16.1895 10.1404 16.6338 10.3668C16.9542 10.5301 17.2727 10.5821 17.5426 10.6041C17.7883 10.6242 18.0784 10.6242 18.3764 10.6241H23.5902C23.6211 10.6241 23.6366 10.6241 23.6648 10.6255C24.2478 10.6533 24.7603 11.166 24.7878 11.749C24.7891 11.7771 24.7891 11.7863 24.7891 11.8046V20.3534C24.7891 21.3038 24.7891 22.088 24.7369 22.727C24.6827 23.3905 24.5663 24.0005 24.2743 24.5736C23.8216 25.4621 23.0992 26.1844 22.2107 26.6372C21.6377 26.9291 21.0277 27.0455 20.3641 27.0997C19.7252 27.1519 18.9409 27.1519 17.9906 27.1519H10.3375C9.38721 27.1519 8.6029 27.1519 7.964 27.0997C7.30041 27.0455 6.69041 26.9291 6.11744 26.6372C5.2289 26.1844 4.50649 25.4621 4.05376 24.5736C3.76181 24.0005 3.64545 23.3905 3.59124 22.727C3.53904 22.088 3.53905 21.3038 3.53906 20.3534V7.97814C3.53905 7.02784 3.53904 6.24353 3.59124 5.60462C3.64545 4.94103 3.76181 4.33104 4.05376 3.75807C4.50649 2.86952 5.2289 2.14712 6.11744 1.69439C6.69041 1.40245 7.30041 1.28608 7.964 1.23187C8.60289 1.17966 9.38719 1.17968 10.3375 1.17969H14.1641C14.1825 1.17968 14.1917 1.17968 14.2199 1.18101C14.8027 1.20859 15.3155 1.72097 15.3433 2.3039Z"
                            fill="#DCDFEC"
                          />
                          <path
                            d="M22.9864 8.17816C22.8445 8.2652 22.6712 8.2652 22.3245 8.26519L18.6554 8.26514C18.3248 8.26514 18.1595 8.26513 18.0332 8.2008C17.9221 8.14421 17.8318 8.05391 17.7753 7.94284C17.7109 7.81658 17.7109 7.65129 17.7109 7.32071V3.65164C17.7109 3.305 17.7109 3.13169 17.7979 2.9897C17.921 2.7892 18.2105 2.66932 18.4392 2.72429C18.6011 2.76321 18.7141 2.87624 18.9399 3.1023L22.8739 7.03629C23.0999 7.26212 23.2129 7.37504 23.2519 7.53695C23.3068 7.76564 23.1869 8.05524 22.9864 8.17816Z"
                            fill="#A3ADBA"
                          />
                        </svg>
                        <div className="absolute left-4 top-[17px] flex w-[17px] h-[17px] justify-center items-center rounded-full bg-[#323238]">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4.66443 0.949146C4.82578 0.787785 5.08741 0.787785 5.24877 0.949146L6.90155 2.60192C7.0629 2.76329 7.0629 3.02491 6.90155 3.18627C6.74019 3.34763 6.47856 3.34763 6.31721 3.18627L5.36979 2.23886V6.19965C5.36979 6.42786 5.1848 6.61285 4.9566 6.61285C4.72839 6.61285 4.5434 6.42786 4.5434 6.19965V2.23886L3.59599 3.18627C3.43463 3.34763 3.17301 3.34763 3.01165 3.18627C2.85028 3.02491 2.85028 2.76329 3.01165 2.60192L4.66443 0.949146Z"
                              fill="white"
                            />
                            <path
                              d="M1.24132 4.54688C1.46952 4.54688 1.65451 4.73186 1.65451 4.96007V6.69549C1.65451 7.04943 1.65484 7.29003 1.67003 7.47601C1.68483 7.65716 1.71166 7.74979 1.74459 7.81442C1.82381 7.9699 1.95024 8.09634 2.10573 8.17555C2.17035 8.20848 2.26299 8.2353 2.44414 8.25009C2.63012 8.2653 2.87072 8.26563 3.22465 8.26563H6.69549C7.04943 8.26563 7.29003 8.2653 7.47601 8.25009C7.65715 8.2353 7.74979 8.20848 7.81442 8.17555C7.9699 8.09634 8.09634 7.9699 8.17555 7.81442C8.20848 7.74979 8.2353 7.65716 8.25009 7.47601C8.26529 7.29003 8.26562 7.04943 8.26562 6.69549V4.96007C8.26562 4.73186 8.45061 4.54688 8.67882 4.54688C8.90703 4.54688 9.09201 4.73186 9.09201 4.96007V6.71255C9.09201 7.04517 9.09201 7.31966 9.07375 7.54328C9.05478 7.77554 9.01404 7.98903 8.91186 8.1896C8.7534 8.50057 8.50057 8.7534 8.1896 8.91186C7.98903 9.01404 7.77553 9.05479 7.54328 9.07375C7.31966 9.09201 7.04517 9.09201 6.71255 9.09201H3.2076C2.87498 9.09201 2.60047 9.09201 2.37685 9.07375C2.1446 9.05479 1.93109 9.01404 1.73056 8.91186C1.41957 8.7534 1.16673 8.50057 1.00827 8.1896C0.906087 7.98903 0.865362 7.77554 0.846384 7.54328C0.828117 7.31966 0.828121 7.04517 0.828125 6.71255V4.96007C0.828125 4.73186 1.01312 4.54688 1.24132 4.54688Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                      </div>
                      <span className="text-[#505258] font-roboto text-[13px] font-medium leading-normal">
                        {file ? (
                          file.name
                        ) : (
                          <>
                            <span className="text-[#505258]">
                              Drag & Drop File Here
                            </span>
                            <span className="text-[#172B4D]"> or </span>
                            <span className="text-[#0073EA]">Choose File</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center self-stretch mt-1">
                    <span className="text-[#505258] font-roboto text-xs font-normal leading-5">
                      Supported Formats: JPG, JPEG, PNG, SVG, .XLS
                    </span>
                    <span className="text-[#505258] font-roboto text-xs font-normal leading-5">
                      Maximum Size: 25MB
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !subject.trim() || !plainText.trim()}
                  className="flex h-[38px] px-4 py-[11px] justify-center items-center gap-2.5 rounded bg-[#0073EA] text-white font-roboto text-[13px] font-medium leading-normal disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0062C6] transition-colors"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
