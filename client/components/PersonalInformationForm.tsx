import { useState } from 'react';
import { FormData } from '@shared/templates';

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
  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
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
                    className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                  />
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
                    className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                  />
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
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                  />
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
                        className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                      />
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
                  {!isEmailVerified && (
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
                        className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                      />
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
                  {!isPhoneVerified && (
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
        <div className="flex flex-col items-start gap-4 self-stretch">
          <div className="flex pb-1 flex-col items-start gap-1 self-stretch">
            <div className="text-text-primary font-roboto text-[16px] font-bold leading-[26px]">
              Residential Address <span className="font-normal text-[13px] text-text-muted">(as per ID)</span>
            </div>
            <div className="self-stretch text-text-muted font-roboto text-[13px] font-normal leading-5">
              Enter your residential address exactly as shown on your government-issued ID.
            </div>
          </div>
          
          <div className="flex flex-col items-start self-stretch">
            {/* Address Field */}
            <div className="flex h-20 items-start gap-6 self-stretch">
              <div className="flex flex-col items-start flex-1">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                    Address
                  </div>
                </div>
                <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="e.g 123 MG Road, Shastri Nagar, Near City Park"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* City and Postal Code Row */}
            <div className="inline-flex items-start gap-6 w-[928px] h-14">
              {/* City */}
              <div className="flex flex-col items-start flex-1">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                    City
                  </div>
                </div>
                <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background">
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
              <div className="flex flex-col items-start flex-1">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                    Postal Code
                  </div>
                </div>
                <div className="flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border border-input-border bg-background">
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
