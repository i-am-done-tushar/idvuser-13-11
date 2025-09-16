import { TemplateSection } from "@shared/templates";

interface StepSidebarProps {
  sections: TemplateSection[];
  currentStep: number;
}

interface Step {
  number: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
}

export function StepSidebar({ sections, currentStep }: StepSidebarProps) {
  // Map sections to steps with proper descriptions
  const steps: Step[] = sections.map((section, index) => {
    const stepNumber = index + 1;
    let description = "";
    
    switch (section.sectionType) {
      case "personalInformation":
        description = "Tell us about yourself. Please provide your basic personal information to begin the identity verification process.";
        break;
      case "documents":
        description = "Choose a valid government-issued ID (like a passport, driver's license, or national ID) and upload a clear photo of it.";
        break;
      case "biometrics":
        description = "Take a live selfie to confirm you are the person in the ID document. Make sure you're in a well-lit area and your face is clearly visible.";
        break;
    }

    return {
      number: stepNumber,
      title: section.name,
      description,
      isActive: stepNumber === currentStep,
      isCompleted: stepNumber < currentStep,
    };
  });

  return (
    <div className="flex w-80 h-full p-4 flex-col items-start gap-1 flex-shrink-0 rounded-l-lg bg-background">
      {steps.map((step, index) => (
        <div key={step.number} className="h-auto flex-shrink-0 self-stretch relative">
          {/* Step Content Card */}
          <div 
            className={`flex w-[263px] p-3 flex-col items-start gap-1 rounded-lg ${
              step.isActive ? 'bg-step-active-bg' : 'bg-background'
            } absolute left-[41px] top-0`}
          >
            {/* Step Title */}
            <div className="self-stretch text-text-primary font-roboto text-[15px] font-bold leading-6">
              {step.title}
            </div>
            
            {/* Step Details */}
            <div className="flex flex-col items-start gap-1 self-stretch">
              <div className="self-stretch text-text-primary font-roboto text-[13px] font-normal">
                Step {step.number}
              </div>
              <div className="self-stretch text-text-secondary font-figtree text-[13px] font-normal leading-5">
                {step.description}
              </div>
            </div>
          </div>

          {/* Step Number Circle and Connector */}
          <div className="w-[29px] h-[110px] flex-shrink-0 absolute left-0 top-1.5">
            {/* Circle */}
            <div className="w-[29px] h-7 flex-shrink-0 absolute left-0 top-0">
              <svg 
                className="w-[29px] h-7 flex-shrink-0 absolute left-0 top-0" 
                viewBox="0 0 29 28" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M14.2822 0.75C21.7697 0.750184 27.8135 6.69636 27.8135 14C27.8135 21.3036 21.7697 27.2498 14.2822 27.25C6.79461 27.25 0.75 21.3037 0.75 14C0.75 6.69625 6.79461 0.75 14.2822 0.75Z" 
                  fill={step.isActive || step.isCompleted ? "#0073EA" : "white"}
                  stroke={step.isActive || step.isCompleted ? "#0073EA" : "#D0D4E4"}
                  strokeWidth="1.5"
                />
              </svg>
              {/* Step Number */}
              <div className="absolute left-2.5 top-1.5 w-2 h-[15px]">
                <span className={`font-roboto text-[13px] font-normal ${
                  step.isActive || step.isCompleted ? 'text-white' : 'text-text-secondary'
                }`}>
                  {step.number}
                </span>
              </div>
            </div>
            
            {/* Connector Line (except for last step) */}
            {index < steps.length - 1 && (
              <div 
                className={`w-[71px] h-0 absolute left-3.5 top-10 border-t ${
                  step.isCompleted ? 'border-primary' : 'border-step-inactive-border'
                }`}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
