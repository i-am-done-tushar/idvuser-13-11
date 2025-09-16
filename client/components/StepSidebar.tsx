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
    <aside className="w-80 p-4 flex flex-col gap-6 bg-background h-full relative">
      {steps.map((step, idx) => (
        <div key={step.number} className="flex items-start gap-4">
          {/* Left column: circle + connector */}
          <div className="flex flex-col items-center w-10">
            <div
              className={`flex items-center justify-center rounded-full transition-all duration-150 ${
                step.isActive
                  ? 'w-10 h-10 bg-primary text-white shadow-md ring-4 ring-primary/20'
                  : step.isCompleted
                  ? 'w-8 h-8 bg-primary text-white'
                  : 'w-8 h-8 bg-white border border-input-border text-text-secondary'
              }`}
            >
              <span className={`text-[13px] font-roboto ${step.isActive ? 'font-semibold' : 'font-normal'}`}>
                {step.number}
              </span>
            </div>

            {/* connector segment between this and the next step; hidden after step 3 */}
            {idx < steps.length - 1 && step.number !== 3 && (
              <div
                className={`mt-2 w-[2px] rounded ${
                  step.isCompleted ? 'bg-primary' : 'bg-step-inactive-border'
                } h-28 md:h-36 lg:h-44`}
                aria-hidden
              />
            )}
          </div>

          {/* Right column: card */}
          <div className={`flex-1 rounded-md overflow-hidden ${step.isActive ? 'bg-step-active-bg shadow-sm border border-primary/20' : 'bg-white'}`}>
            <div className={`p-3 ${step.isActive ? '' : 'p-0'}`}>
              <div className={`px-3 py-2 ${step.isActive ? '' : 'px-0 py-0'}`}>
                <div className={`text-text-primary font-roboto ${step.isActive ? 'text-[15px] font-semibold' : 'text-[15px] font-bold'}`}>
                  {step.title}
                </div>
                <div className="mt-1 text-text-primary font-roboto text-[13px] font-medium">Step {step.number}</div>
                <div className="mt-2 text-text-secondary font-figtree text-[13px] leading-5">
                  {step.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </aside>
  );
}
