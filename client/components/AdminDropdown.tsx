import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminDropdownProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function AdminDropdown({ onExpandAll, onCollapseAll }: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center w-8 h-8 rounded border border-border bg-background hover:bg-muted transition-colors">
          <svg
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.49984 13.6666L4.27067 16.9166C4.104 17.0833 3.90956 17.1666 3.68734 17.1666C3.46511 17.1666 3.27067 17.0833 3.104 16.9166C2.93734 16.7499 2.854 16.552 2.854 16.3228C2.854 16.0937 2.93734 15.8958 3.104 15.7291L6.33317 12.4999H4.99984C4.76373 12.4999 4.56581 12.4201 4.40609 12.2603C4.24636 12.1006 4.1665 11.9027 4.1665 11.6666C4.1665 11.4305 4.24636 11.2326 4.40609 11.0728C4.56581 10.9131 4.76373 10.8333 4.99984 10.8333H8.33317C8.56928 10.8333 8.7672 10.9131 8.92692 11.0728C9.08664 11.2326 9.1665 11.4305 9.1665 11.6666V14.9999C9.1665 15.236 9.08664 15.4339 8.92692 15.5937C8.7672 15.7534 8.56928 15.8333 8.33317 15.8333C8.09706 15.8333 7.89914 15.7534 7.73942 15.5937C7.5797 15.4339 7.49984 15.236 7.49984 14.9999V13.6666ZM13.6665 7.49992H14.9998C15.2359 7.49992 15.4339 7.57978 15.5936 7.7395C15.7533 7.89922 15.8332 8.09714 15.8332 8.33325C15.8332 8.56936 15.7533 8.76728 15.5936 8.927C15.4339 9.08672 15.2359 9.16659 14.9998 9.16659H11.6665C11.4304 9.16659 11.2325 9.08672 11.0728 8.927C10.913 8.76728 10.8332 8.56936 10.8332 8.33325V4.99992C10.8332 4.76381 10.913 4.56589 11.0728 4.40617C11.2325 4.24645 11.4304 4.16659 11.6665 4.16659C11.9026 4.16659 12.1005 4.24645 12.2603 4.40617C12.42 4.56589 12.4998 4.76381 12.4998 4.99992V6.33325L15.729 3.08325C15.8957 2.91659 16.0901 2.83325 16.3123 2.83325C16.5346 2.83325 16.729 2.91659 16.8957 3.08325C17.0623 3.24992 17.1457 3.44784 17.1457 3.677C17.1457 3.90617 17.0623 4.10409 16.8957 4.27075L13.6665 7.49992Z"
              fill="#515257"
            />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[200px] p-2 bg-white border border-border rounded shadow-lg"
      >
        <DropdownMenuItem
          onClick={onExpandAll}
          className="flex items-center gap-2 px-2 py-2 hover:bg-[#DCDFEC] rounded cursor-pointer"
        >
          <svg
            className="w-[18px] h-[18px]"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.125 7.5L15.375 2.25M15.375 2.25H10.875M15.375 2.25V6.75M7.125 10.5L1.875 15.75M1.875 15.75H6.375M1.875 15.75V11.25"
              stroke="#515257"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#676879] font-figtree text-[13px] font-medium">
            Expand all
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onCollapseAll}
          className="flex items-center gap-2 px-2 py-2 hover:bg-muted rounded cursor-pointer"
        >
          <svg
            className="w-[18px] h-[18px]"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.78261 4.07407L9 8.5M9 8.5L14.5 2.5M9 8.5L13.8696 8.22222M7.65217 10.2963H3.13043M7.65217 10.2963L2 16M7.65217 10.2963L7.93478 14.4444"
              stroke="#515257"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[#676879] font-figtree text-[13px] font-medium">
            Collapse all
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
