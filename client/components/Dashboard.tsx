import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardCard } from "./DashboardCard";
import { OngoingVerificationSection } from "./OngoingVerificationSection";

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("verified");

  const handleNavigation = (section: string) => {
    setActiveSection(section);
  };

  const navItems = [
    {
      id: "ongoing",
      label: "Ongoing Verification",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      onClick: () => handleNavigation("ongoing"),
      isActive: activeSection === "ongoing",
    },
    {
      id: "expired",
      label: "Expired Verification",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ),
      onClick: () => handleNavigation("expired"),
      isActive: activeSection === "expired",
    },
    {
      id: "verified",
      label: "Verified Credentials",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
      ),
      onClick: () => handleNavigation("verified"),
      isActive: activeSection === "verified",
    },
    {
      id: "contact",
      label: "Contact Admin",
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12h-8v-2h8v2zm0-3h-8V9h8v2zm0-3h-8V6h8v2z" />
        </svg>
      ),
      onClick: () => handleNavigation("contact"),
      isActive: activeSection === "contact",
    },
  ];

  const dashboardCards = [
    {
      id: "ongoing",
      title: "Ongoing Verification",
      description: "Verifications currently in progress",
      count: 2,
      color: "blue" as const,
    },
    {
      id: "expired",
      title: "Expired Verification",
      description: "Verifications that have expired",
      count: 1,
      color: "red" as const,
    },
    {
      id: "verified",
      title: "Verified Credentials",
      description: "Successfully verified credentials",
      count: 5,
      color: "green" as const,
    },
    {
      id: "contact",
      title: "Contact Admin",
      description: "Need help? Reach out to support",
      color: "orange" as const,
    },
  ];

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      ongoing: "Ongoing Verifications",
      expired: "Expired Verifications",
      verified: "Verified Credentials",
      contact: "Contact Administrator",
    };
    return titles[activeSection] || "Dashboard";
  };

  const getPageDescription = () => {
    const descriptions: Record<string, string> = {
      ongoing:
        "View and manage all verifications currently in progress. Your data is encrypted and secure.",
      expired:
        "Review verifications that have expired. Re-submit if needed to complete your verification.",
      verified:
        "View and manage all successful verifications. Your data is encrypted and accessible only to authorized parties.",
      contact:
        "Have questions or need assistance? Get in touch with our support team.",
    };
    return descriptions[activeSection] || "";
  };

  return (
    <div className="w-full h-screen bg-page-background flex flex-row">
      {/* Desktop Sidebar - Left Side, Full Height */}
      <div className="hidden lg:flex lg:w-64 bg-white border-r border-border flex-shrink-0 h-screen flex-col">
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.onClick()}
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

      {/* Right Section - Header + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex w-full h-14 items-center justify-between px-4 lg:px-8 border-b border-border bg-white gap-4 flex-shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-text-primary hover:text-text-muted transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center lg:hidden">
            <svg
              width="64"
              height="16"
              viewBox="0 0 64 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5"
            >
              <path
                d="M19.6451 6.27505C20.4605 5.29486 21.4477 4.80469 22.6065 4.80469C23.2074 4.80469 23.76 4.97008 24.2643 5.30072C24.7686 5.63143 25.1548 6.05658 25.4231 6.57622L25.5679 4.96414H27.6281V14.7073H25.5679L25.4231 13.0776C25.1548 13.5972 24.7686 14.0224 24.2643 14.353C23.76 14.6837 23.2074 14.8491 22.6065 14.8491C21.4477 14.8491 20.4605 14.359 19.6451 13.3787C18.8296 12.3867 18.4219 11.1998 18.4219 9.81804C18.4219 8.43624 18.8296 7.25524 19.6451 6.27505ZM21.3833 11.625C21.8339 12.1327 22.3812 12.3867 23.025 12.3867C23.6795 12.3867 24.2321 12.1387 24.6827 11.6426C25.1334 11.1348 25.3587 10.5266 25.3587 9.81804C25.3587 9.10947 25.1334 8.50713 24.6827 8.0111C24.2321 7.50326 23.6795 7.24938 23.025 7.24938C22.3812 7.24938 21.8339 7.50326 21.3833 8.0111C20.9327 8.50713 20.7073 9.10947 20.7073 9.81804C20.7073 10.5266 20.9327 11.1289 21.3833 11.625ZM29.5129 4.96414H31.573L31.734 6.36361C32.2598 5.38342 33.1343 4.89332 34.3575 4.89332C34.6686 4.89332 34.9369 4.91693 35.1622 4.96414L34.6954 7.35568C34.5667 7.33207 34.4755 7.3202 34.4219 7.3202C33.6707 7.3202 33.0431 7.57415 32.5387 8.08199C32.0344 8.57795 31.7823 9.42237 31.7823 10.6152V14.7073H29.5129V4.96414ZM37.3457 6.29279C38.2255 5.31253 39.2932 4.82243 40.5485 4.82243C41.2996 4.82243 42.0025 5.01729 42.657 5.40702C43.3115 5.78495 43.8534 6.29866 44.2825 6.94821L42.4156 8.31227C41.9542 7.67452 41.3319 7.35568 40.5485 7.35568C39.9262 7.35568 39.3951 7.59776 38.9551 8.08199C38.5153 8.56615 38.2953 9.15074 38.2953 9.83578"
                fill="#323238"
              />
              <path
                d="M26.425 21.7199C27.0492 22.8369 26.2417 24.213 24.9622 24.213H3.93975C2.65324 24.213 1.84661 22.8233 2.48474 21.7062L13.1115 3.10326C13.7582 1.97113 15.3932 1.97882 16.0293 3.11699L26.425 21.7199Z"
                stroke="#D83A52"
                strokeWidth="2.42826"
              />
            </svg>
          </div>

          {/* Admin Badge */}
          <div className="flex items-center gap-1 ml-auto">
            <div className="flex w-8 h-8 justify-center items-center rounded-full bg-[#F65F7C]">
              <span className="text-white font-roboto text-xs font-medium">
                OS
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="w-full px-4 lg:px-8 py-6 gap-6 flex flex-col">
            {activeSection === "ongoing" ? (
              <OngoingVerificationSection />
            ) : (
              <>
                {/* Page Title and Description */}
                <div className="flex flex-col gap-2">
                  <h1 className="text-text-primary font-roboto text-[22px] font-bold leading-[30px]">
                    {getPageTitle()}
                  </h1>
                  <p className="text-text-muted font-roboto text-[13px] font-normal leading-[15px]">
                    {getPageDescription()}
                  </p>
                </div>

                {/* Dashboard Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {dashboardCards.map((card) => (
                    <DashboardCard
                      key={card.id}
                      title={card.title}
                      description={card.description}
                      count={card.count}
                      color={card.color}
                      icon={
                        card.id === "ongoing" ? (
                          <svg
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-6 h-6 text-[#0073EA]"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        ) : card.id === "expired" ? (
                          <svg
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-6 h-6 text-[#D83A52]"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                          </svg>
                        ) : card.id === "verified" ? (
                          <svg
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-6 h-6 text-[#258750]"
                          >
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                          </svg>
                        ) : (
                          <svg
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            className="w-6 h-6 text-[#FF9800]"
                          >
                            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12h-8v-2h8v2zm0-3h-8V9h8v2zm0-3h-8V6h8v2z" />
                          </svg>
                        )
                      }
                      onClick={
                        card.id !== "contact"
                          ? () => handleNavigation(card.id)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <DashboardSidebar
        items={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
