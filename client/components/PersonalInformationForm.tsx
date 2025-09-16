import { useState } from 'react';
import { useState } from 'react';
import { FormData } from '@shared/templates';
import { isValidName, isValidEmail, isValidPhone, isValidDOB, isValidAddress, isValidPostalCode } from '@/lib/validation';

interface PersonalInformationFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  onSendEmailOTP: () => void;
  onSendPhoneOTP: () => void;
}

export function PersonalInformationForm({
  formData,
  setFormData,
  isEmailVerified,
  isPhoneVerified,
  onSendEmailOTP,
  onSendPhoneOTP,
}: PersonalInformationFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const updateField = (field: keyof FormData, value: string) => {
    // Clear error for this field when user changes value
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormData({ ...formData, [field]: value });
  };

  const validateField = (field: keyof FormData) => {
    const value = (formData[field] || '').toString();
    let error: string | undefined = undefined;

    switch (field) {
      case 'firstName':
      case 'lastName':
        if (!isValidName(value)) error = 'Please enter a valid name (at least 2 letters).';
        break;
      case 'dateOfBirth':
        if (!isValidDOB(value)) error = 'Enter a valid DOB (DD/MM/YYYY). You must be at least 18.';
        break;
      case 'email':
        if (!isValidEmail(value)) error = 'Enter a valid email address.';
        break;
      case 'phoneNumber':
        if (!isValidPhone(value)) error = 'Enter a valid 10-digit phone number.';
        break;
      case 'address':
        if (!isValidAddress(value)) error = 'Enter your address (at least 5 characters).';
        break;
      case 'city':
        if (!value || value.trim().length < 2) error = 'Enter your city.';
        break;
      case 'postalCode':
        if (!isValidPostalCode(value)) error = 'Enter a valid postal code.';
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateAll = () => {
    const fields: (keyof FormData)[] = ['firstName','lastName','dateOfBirth','email','phoneNumber','address','city','postalCode'];
    return fields.every((f) => validateField(f));
  };

  // Helpers to convert between DD/MM/YYYY (formData) and YYYY-MM-DD (input[type=date])
  const formatDOBToInput = (dob: string) => {
    if (!dob) return '';
    const m = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return '';
    const day = m[1];
    const month = m[2];
    const year = m[3];
    return `${year}-${month}-${day}`;
  };

  const parseInputDateToDOB = (value: string) => {
    // value is YYYY-MM-DD
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return '';
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  };

  return (
    <div className="flex flex-col items-start self-stretch">
      <div className="flex flex-col items-start gap-6 self-stretch">
        {/* Name Fields Row */}
        <div className="flex flex-col items-start self-stretch">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 self-stretch">
            {/* First Name */}
            <div className="flex flex-col items-start flex-1">
              <div className="flex pb-2 items-start gap-2 self-stretch">
                <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                  First Name
                </div>
              </div>
              <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    onBlur={() => validateField('firstName')}
                    className={`text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted ${errors.firstName ? 'ring-1 ring-destructive/60' : ''}`}
                  />
                  {errors.firstName && (
                    <div className="text-destructive text-[12px] ml-2">{errors.firstName}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Last Name */}
            <div className="flex flex-col items-start flex-1">
              <div className="flex pb-2 items-start gap-2 self-stretch">
                <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                  Last Name
                </div>
              </div>
              <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Enter Your Full Name"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    onBlur={() => validateField('lastName')}
                    className={`text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted ${errors.lastName ? 'ring-1 ring-destructive/60' : ''}`}
                  />
                  {errors.lastName && (
                    <div className="text-destructive text-[12px] ml-2">{errors.lastName}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Middle Name and Date of Birth Row */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 self-stretch mt-6">
            {/* Middle Name */}
            <div className="flex flex-col items-start flex-1">
              <div className="flex pb-2 items-start gap-2 self-stretch">
                <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                  Middle Name
                </div>
              </div>
              <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={formData.middleName}
                    onChange={(e) => updateField('middleName', e.target.value)}
                    className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                  />
                </div>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex w-full sm:w-[452px] flex-col items-start">
              <div className="flex pb-2 items-start gap-2 self-stretch">
                <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                  Date Of Birth
                </div>
              </div>
              <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="date"
                    placeholder="DD/MM/YYYY"
                    value={formatDOBToInput(formData.dateOfBirth)}
                    onChange={(e) => updateField('dateOfBirth', parseInputDateToDOB(e.target.value))}
                    onBlur={() => validateField('dateOfBirth')}
                    className={`text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted ${errors.dateOfBirth ? 'ring-1 ring-destructive/60' : ''}`}
                  />
                  {errors.dateOfBirth && (
                    <div className="text-destructive text-[12px] ml-2">{errors.dateOfBirth}</div>
                  )}
                </div>
                <div className="flex w-[18px] items-center gap-[7.2px]">
                  <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.75 7.49976H2.25M12 1.49976V4.49976M6 1.49976V4.49976M5.85 16.4998H12.15C13.4102 16.4998 14.0401 16.4998 14.5215 16.2545C14.9449 16.0388 15.2891 15.6946 15.5048 15.2713C15.75 14.7899 15.75 14.1599 15.75 12.8998V6.59976C15.75 5.33964 15.75 4.70958 15.5048 4.22828C15.2891 3.80491 14.9449 3.46071 14.5215 3.24499C14.0401 2.99976 13.4102 2.99976 12.15 2.99976H5.85C4.58988 2.99976 3.95982 2.99976 3.47852 3.24499C3.05516 3.46071 2.71095 3.80491 2.49524 4.22828C2.25 4.70958 2.25 5.33964 2.25 6.59976V12.8998C2.25 14.1599 2.25 14.7899 2.49524 15.2713C2.71095 15.6946 3.05516 16.0388 3.47852 16.2545C3.95982 16.4998 4.58988 16.4998 5.85 16.4998Z" stroke="#676879" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Email and Phone Row */}
          <div className="flex flex-col items-start gap-6 self-stretch mt-6">
            <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6 self-stretch">
              {/* Email */}
              <div className="flex flex-col items-start flex-1">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 font-roboto text-[13px] font-normal leading-[18px]">
                    <span className="text-text-primary">Email </span>
                    <span className="text-destructive">*</span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-1 self-stretch">
                  <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="email"
                        placeholder="Enter Your Email Address"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        onBlur={() => validateField('email')}
                        className={`text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted ${errors.email ? 'ring-1 ring-destructive/60' : ''}`}
                      />
                      {errors.email && (
                        <div className="text-destructive text-[12px] ml-2">{errors.email}</div>
                      )}
                    </div>
                    <button
                      onClick={onSendEmailOTP}
                      className="flex h-7 py-[9px] px-3 justify-center items-center gap-2 rounded bg-background"
                    >
                      <span className="text-primary font-figtree text-[12px] font-normal">
                        {isEmailVerified ? 'Verified' : 'Send OTP'}
                      </span>
                    </button>
                  </div>
                  {isEmailVerified ? (
                    <div className="flex h-8 py-0 px-2 items-center gap-2 self-stretch rounded bg-[#BBDBC9]">
                      <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.52363 9C1.5234 8.89965 1.50369 8.79937 1.46449 8.70487L0.923408 7.39481C0.809093 7.11891 0.750045 6.82274 0.75 6.52409C0.749952 6.22529 0.808785 5.92939 0.92313 5.65332C1.03747 5.37725 1.2051 5.12642 1.41642 4.91516C1.62769 4.70396 1.87849 4.53644 2.1545 4.42217L3.46245 3.88038C3.65187 3.80206 3.80295 3.65165 3.88181 3.46244L4.42373 2.15411C4.65456 1.59679 5.09734 1.154 5.65465 0.923138C6.21196 0.692288 6.83815 0.692287 7.39546 0.923138L8.70278 1.46468C8.89252 1.543 9.10575 1.5429 9.29535 1.46423L9.29685 1.46362L10.6053 0.923941C11.1624 0.693398 11.7887 0.693323 12.3458 0.924068C12.903 1.15488 13.3457 1.59755 13.5766 2.15471L14.1055 3.43164C14.1102 3.44172 14.1147 3.45194 14.119 3.46231C14.1974 3.65193 14.3478 3.80268 14.5372 3.88148L15.8459 4.42358C16.4032 4.65443 16.8461 5.09723 17.0769 5.65454C17.3077 6.21185 17.3077 6.83804 17.0769 7.39536L16.5351 8.70337C16.4957 8.79832 16.4761 8.89958 16.4761 9.00023C16.4761 9.10087 16.4957 9.20168 16.5351 9.29663L17.0769 10.6046C17.3077 11.1619 17.3077 11.7881 17.0769 12.3454C16.8461 12.9028 16.4032 13.3456 15.8459 13.5764L14.5372 14.1185C14.3478 14.1973 14.1974 14.3481 14.119 14.5377C14.1147 14.5481 14.1102 14.5583 14.1055 14.5684L13.5766 15.8453C13.3457 16.4024 12.903 16.8451 12.3458 17.0759C11.7887 17.3067 11.1624 17.3066 10.6053 17.0761L9.29685 16.5364L9.29535 16.5358C9.10575 16.4571 8.89252 16.457 8.70278 16.5353L7.39546 17.0768C6.83815 17.3078 6.21196 17.3078 5.65465 17.0768C5.09734 16.846 4.65456 16.4032 4.42373 15.8459L3.88181 14.5375C3.80295 14.3483 3.65187 14.198 3.46245 14.1197L2.1545 13.5779C1.87849 13.4636 1.62769 13.2961 1.41642 13.0849C1.2051 12.8736 1.03747 12.6227 0.92313 12.3467C0.808785 12.0706 0.749952 11.7747 0.75 11.4759C0.750045 11.1772 0.809093 10.8811 0.923408 10.6051L1.46449 9.29513C1.50369 9.20063 1.5234 9.10035 1.52363 9ZM12.1553 7.65532C12.4482 7.36244 12.4482 6.88757 12.1553 6.59467C11.8624 6.30178 11.3876 6.30178 11.0947 6.59467L8.25 9.43935L7.28033 8.46968C6.98744 8.1768 6.51256 8.1768 6.21967 8.46968C5.92678 8.76255 5.92678 9.23745 6.21967 9.53032L7.71968 11.0303C8.01255 11.3232 8.48745 11.3232 8.78032 11.0303L12.1553 7.65532Z" fill="#258750"/>
                      </svg>
                      <div className="text-text-primary font-roboto text-[12px] font-normal leading-[22px]">
                        Your email has been verified
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-8 py-0 px-2 items-center gap-2 self-stretch rounded border border-border bg-secondary">
                      <svg className="w-[18px] h-[18px] aspect-1" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_info)">
                          <path d="M9 12V9M9 6H9.0075M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" stroke="#344563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_info">
                            <rect width="18" height="18" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                      <div className="text-text-secondary font-roboto text-[12px] font-normal leading-[22px]">
                        Email verification is required to continue
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col items-start flex-1">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 font-roboto text-[13px] font-normal leading-[18px]">
                    <span className="text-text-primary">Phone Number </span>
                    <span className="text-destructive">*</span>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-1 self-stretch">
                  <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="tel"
                        placeholder="Enter Your Mobile Number"
                        value={formData.phoneNumber}
                        onChange={(e) => updateField('phoneNumber', e.target.value)}
                        onBlur={() => validateField('phoneNumber')}
                        className={`text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted ${errors.phoneNumber ? 'ring-1 ring-destructive/60' : ''}`}
                      />
                      {errors.phoneNumber && (
                        <div className="text-destructive text-[12px] ml-2">{errors.phoneNumber}</div>
                      )}
                    </div>
                    <button
                      onClick={onSendPhoneOTP}
                      className="flex h-7 py-[9px] px-3 justify-center items-center gap-2 rounded bg-background"
                    >
                      <span className="text-primary font-figtree text-[12px] font-normal">
                        {isPhoneVerified ? 'Verified' : 'Send OTP'}
                      </span>
                    </button>
                  </div>
                  {isPhoneVerified ? (
                    <div className="flex h-8 py-0 px-2 items-center gap-2 self-stretch rounded bg-[#BBDBC9]">
                      <svg className="w-[18px] h-[18px] flex-shrink-0" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.52363 9C1.5234 8.89965 1.50369 8.79937 1.46449 8.70487L0.923408 7.39481C0.809093 7.11891 0.750045 6.82274 0.75 6.52409C0.749952 6.22529 0.808785 5.92939 0.92313 5.65332C1.03747 5.37725 1.2051 5.12642 1.41642 4.91516C1.62769 4.70396 1.87849 4.53644 2.1545 4.42217L3.46245 3.88038C3.65187 3.80206 3.80295 3.65165 3.88181 3.46244L4.42373 2.15411C4.65456 1.59679 5.09734 1.154 5.65465 0.923138C6.21196 0.692288 6.83815 0.692287 7.39546 0.923138L8.70278 1.46468C8.89252 1.543 9.10575 1.5429 9.29535 1.46423L9.29685 1.46362L10.6053 0.923941C11.1624 0.693398 11.7887 0.693323 12.3458 0.924068C12.903 1.15488 13.3457 1.59755 13.5766 2.15471L14.1055 3.43164C14.1102 3.44172 14.1147 3.45194 14.119 3.46231C14.1974 3.65193 14.3478 3.80268 14.5372 3.88148L15.8459 4.42358C16.4032 4.65443 16.8461 5.09723 17.0769 5.65454C17.3077 6.21185 17.3077 6.83804 17.0769 7.39536L16.5351 8.70337C16.4957 8.79832 16.4761 8.89958 16.4761 9.00023C16.4761 9.10087 16.4957 9.20168 16.5351 9.29663L17.0769 10.6046C17.3077 11.1619 17.3077 11.7881 17.0769 12.3454C16.8461 12.9028 16.4032 13.3456 15.8459 13.5764L14.5372 14.1185C14.3478 14.1973 14.1974 14.3481 14.119 14.5377C14.1147 14.5481 14.1102 14.5583 14.1055 14.5684L13.5766 15.8453C13.3457 16.4024 12.903 16.8451 12.3458 17.0759C11.7887 17.3067 11.1624 17.3066 10.6053 17.0761L9.29685 16.5364L9.29535 16.5358C9.10575 16.4571 8.89252 16.457 8.70278 16.5353L7.39546 17.0768C6.83815 17.3078 6.21196 17.3078 5.65465 17.0768C5.09734 16.846 4.65456 16.4032 4.42373 15.8459L3.88181 14.5375C3.80295 14.3483 3.65187 14.198 3.46245 14.1197L2.1545 13.5779C1.87849 13.4636 1.62769 13.2961 1.41642 13.0849C1.2051 12.8736 1.03747 12.6227 0.92313 12.3467C0.808785 12.0706 0.749952 11.7747 0.75 11.4759C0.750045 11.1772 0.809093 10.8811 0.923408 10.6051L1.46449 9.29513C1.50369 9.20063 1.5234 9.10035 1.52363 9ZM12.1553 7.65532C12.4482 7.36244 12.4482 6.88757 12.1553 6.59467C11.8624 6.30178 11.3876 6.30178 11.0947 6.59467L8.25 9.43935L7.28033 8.46968C6.98744 8.1768 6.51256 8.1768 6.21967 8.46968C5.92678 8.76255 5.92678 9.23745 6.21967 9.53032L7.71968 11.0303C8.01255 11.3232 8.48745 11.3232 8.78032 11.0303L12.1553 7.65532Z" fill="#258750"/>
                      </svg>
                      <div className="text-text-primary font-roboto text-[12px] font-normal leading-[22px]">
                        Your phone number has been verified
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-8 py-0 px-2 items-center gap-2 self-stretch rounded border border-border bg-secondary">
                      <svg className="w-[18px] h-[18px] aspect-1" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_info2)">
                          <path d="M9 12V9M9 6H9.0075M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z" stroke="#344563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_info2">
                            <rect width="18" height="18" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                      <div className="text-text-secondary font-roboto text-[12px] font-normal leading-[22px]">
                        Email verification is required to continue
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gender Selection */}
            <div className="flex w-full items-start gap-4 lg:gap-6">
              <div className="flex w-full lg:w-[458px] h-auto lg:h-14 items-start gap-4 lg:gap-6 flex-shrink-0">
                <div className="flex w-full h-auto lg:h-14 flex-col items-start flex-1">
                  <div className="flex pb-2 items-start gap-2 self-stretch">
                    <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                      Gender
                    </div>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 sm:gap-3">
                    {['Male', 'Female', 'Non-Binary', 'Prefer Not To Say'].map((option) => (
                      <div key={option} className="flex h-[38px] py-2 pr-2 items-center gap-2 rounded-full">
                        <div className="w-4 h-4 rounded-full border-[0.667px] border-step-inactive-border bg-background relative">
                          <input
                            type="radio"
                            name="gender"
                            value={option}
                            checked={formData.gender === option}
                            onChange={(e) => updateField('gender', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          {formData.gender === option && (
                            <div className="absolute inset-1 rounded-full bg-primary" />
                          )}
                        </div>
                        <label className="text-text-muted font-roboto text-[13px] font-normal leading-[22px] cursor-pointer">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Residential Address Section */}
        <div className="flex flex-col items-start gap-4 self-stretch w-full">
          <div className="flex pb-1 flex-col items-start gap-1 self-stretch">
            <div className="text-text-primary font-roboto text-[16px] font-bold leading-[26px]">
              Residential Address <span className="font-normal text-[13px] text-text-muted">(as per ID)</span>
            </div>
            <div className="self-stretch text-text-muted font-roboto text-[13px] font-normal leading-5">
              Enter your residential address exactly as shown on your government-issued ID.
            </div>
          </div>

          <div className="flex flex-col items-start self-stretch w-full">
            {/* Address Field */}
            <div className="flex h-auto items-start gap-4 self-stretch w-full">
              <div className="flex flex-col items-start flex-1 w-full">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                    Address
                  </div>
                </div>
                <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background w-full">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="e.g 123 MG Road, Shastri Nagar, Near City Park"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      onBlur={() => validateField('address')}
                      className={`text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted ${errors.address ? 'ring-1 ring-destructive/60' : ''}`}
                    />
                    {errors.address && (
                      <div className="text-destructive text-[12px] ml-2">{errors.address}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* City and Postal Code Row */}
            <div className="inline-flex flex-col sm:flex-row items-start gap-4 sm:gap-6 w-full mt-6">
              {/* City */}
              <div className="flex flex-col items-start w-full sm:flex-1">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                    City
                  </div>
                </div>
                <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background w-full">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="e.g Mumbai"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Postal Code */}
              <div className="flex flex-col items-start w-full sm:flex-1">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                    Postal Code
                  </div>
                </div>
                <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background w-full">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="e.g 432001"
                      value={formData.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                    />
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
