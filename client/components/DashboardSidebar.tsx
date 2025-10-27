import { useState } from "react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
}

interface DashboardSidebarProps {
  items: SidebarItem[];
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({
  items,
  isOpen = true,
  onClose,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {!isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative lg:flex lg:flex-col lg:h-screen lg:w-64 bg-white border-r border-border transition-all duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 w-64 flex-shrink-0`}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between h-14 px-6 border-b border-border lg:hidden">
          <span className="text-text-primary font-roboto font-bold text-base">
            Menu
          </span>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.onClick();
                onClose?.();
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all text-left ${
                item.isActive
                  ? "bg-[#0073EA]/10 text-[#0073EA] border border-[#0073EA]/20"
                  : "text-text-primary hover:bg-page-background"
              }`}
            >
              <span className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                {item.icon}
              </span>
              <span className="font-roboto text-sm font-medium leading-normal">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
