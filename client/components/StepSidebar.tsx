import { TemplateSection } from "@shared/templates";

interface StepSidebarProps {
  sections: TemplateSection[];
  currentStep: number;
}

export function StepSidebar({ sections, currentStep }: StepSidebarProps) {
  const steps = sections.map((s, i) => ({
    number: i + 1,
    title: s.name,
    description:
      s.sectionType === "personalInformation"
        ? "Please provide your basic personal information to begin the identity verification process."
        : s.sectionType === "documents"
        ? "Choose a valid government-issued ID (like a passport, driver's license, or national ID) and upload a clear photo of it."
        : "Take a live selfie to confirm you are the person in the ID document.",
    isActive: i + 1 === currentStep,
    isCompleted: i + 1 < currentStep,
  }));

  return (
    <aside className="w-80 bg-white h-full">
      <div className="flex flex-col gap-1 p-2">
        {steps.map((step, idx) => (
          <div key={step.number} className="relative">
            {/* Step content container */}
            <div className="flex items-start gap-3">
              {/* Circle with connecting line */}
              <div className="flex flex-col items-center relative z-10">
                {/* Step circle */}
                <div className="relative">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                  >
                    <circle
                      cx="14"
                      cy="14"
                      r="13.25"
                      fill={step.isActive || step.isCompleted ? "#0073EA" : "white"}
                      stroke={step.isActive || step.isCompleted ? "#0073EA" : "#D0D4E4"}
                      strokeWidth="1.5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={`font-roboto text-[13px] font-normal leading-none ${
                        step.isActive || step.isCompleted ? "text-white" : "text-[#42526E]"
                      }`}
                    >
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Connecting line */}
                {idx < steps.length - 1 && (
                  <div className="mt-2 mb-2">
                    <div
                      className={`w-0 h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 border-l-2 ${
                        step.isCompleted ? "border-[#0073EA]" : "border-[#D0D4E4]"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Step card */}
              <div
                className={`flex-1 rounded-lg p-3 ${
                  step.isActive
                    ? "bg-[#E6F1FD]"
                    : "bg-white"
                } ${idx < steps.length - 1 ? "mb-1" : ""}`}
              >
                <div className="flex flex-col gap-1">
                  {/* Title */}
                  <h3
                    className={`font-roboto text-[15px] font-bold leading-6 ${
                      step.isActive ? "text-[#323238]" : "text-[#323238]"
                    }`}
                  >
                    {step.title}
                  </h3>
                  
                  {/* Step number */}
                  <div className="font-roboto text-[13px] font-medium text-[#323238] leading-normal">
                    Step {step.number}
                  </div>
                  
                  {/* Description */}
                  <p
                    className={`font-figtree text-[13px] font-normal leading-5 mt-1 ${
                      step.isActive ? "text-[#172B4D]" : "text-[#42526E]"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
