import { PasswordStrength } from "@/lib/password-validation";

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  onDismiss?: () => void;
}

export function PasswordStrengthIndicator({
  strength,
  onDismiss,
}: PasswordStrengthIndicatorProps) {
  return (
    <div 
      className="flex flex-col items-start gap-2 p-2 rounded bg-[#F6F7FB] cursor-pointer transition-opacity hover:opacity-90"
      onClick={onDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDismiss?.();
        }
      }}
      aria-label="Password requirements (click to dismiss)"
    >
      <p className="text-xs font-medium text-[#323238] leading-normal">
        Password must contain:
      </p>
      
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-1">
          {strength.requirements.minLength ? (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1ZM14.3393 7.80589C14.5914 7.47214 14.5225 6.99997 14.1888 6.74785C13.855 6.49574 13.3828 6.56468 13.1307 6.89843L8.75 12.6552L6.80589 10.3393C6.52339 10.0061 6.04662 9.96575 5.71339 10.2482C5.38016 10.5307 5.33985 11.0075 5.62236 11.3407L8.12236 14.3407C8.28643 14.5358 8.53568 14.6411 8.79285 14.6242C9.05002 14.6074 9.28397 14.4704 9.42074 14.2516L14.3393 7.80589Z" fill="#676879"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.1693 5.83594L5.83594 14.1693M5.83594 5.83594L14.1693 14.1693" stroke="#676879" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className="text-xs font-normal leading-5 text-[#676879]">
            At least 8 characters
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {strength.requirements.hasUppercase ? (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1ZM14.3393 7.80589C14.5914 7.47214 14.5225 6.99997 14.1888 6.74785C13.855 6.49574 13.3828 6.56468 13.1307 6.89843L8.75 12.6552L6.80589 10.3393C6.52339 10.0061 6.04662 9.96575 5.71339 10.2482C5.38016 10.5307 5.33985 11.0075 5.62236 11.3407L8.12236 14.3407C8.28643 14.5358 8.53568 14.6411 8.79285 14.6242C9.05002 14.6074 9.28397 14.4704 9.42074 14.2516L14.3393 7.80589Z" fill="#676879"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.1693 5.83594L5.83594 14.1693M5.83594 5.83594L14.1693 14.1693" stroke="#676879" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className="text-xs font-normal leading-5 text-[#676879]">
            One uppercase letter
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {strength.requirements.hasNumber ? (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1ZM14.3393 7.80589C14.5914 7.47214 14.5225 6.99997 14.1888 6.74785C13.855 6.49574 13.3828 6.56468 13.1307 6.89843L8.75 12.6552L6.80589 10.3393C6.52339 10.0061 6.04662 9.96575 5.71339 10.2482C5.38016 10.5307 5.33985 11.0075 5.62236 11.3407L8.12236 14.3407C8.28643 14.5358 8.53568 14.6411 8.79285 14.6242C9.05002 14.6074 9.28397 14.4704 9.42074 14.2516L14.3393 7.80589Z" fill="#676879"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.1693 5.83594L5.83594 14.1693M5.83594 5.83594L14.1693 14.1693" stroke="#676879" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className="text-xs font-normal leading-5 text-[#676879]">
            One number
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {strength.requirements.hasSpecialChar ? (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1ZM14.3393 7.80589C14.5914 7.47214 14.5225 6.99997 14.1888 6.74785C13.855 6.49574 13.3828 6.56468 13.1307 6.89843L8.75 12.6552L6.80589 10.3393C6.52339 10.0061 6.04662 9.96575 5.71339 10.2482C5.38016 10.5307 5.33985 11.0075 5.62236 11.3407L8.12236 14.3407C8.28643 14.5358 8.53568 14.6411 8.79285 14.6242C9.05002 14.6074 9.28397 14.4704 9.42074 14.2516L14.3393 7.80589Z" fill="#258750"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.1693 5.83594L5.83594 14.1693M5.83594 5.83594L14.1693 14.1693" stroke="#676879" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <span className="text-xs font-normal leading-5 text-[#676879]">
            One special character
          </span>
        </div>
      </div>
    </div>
  );
}
