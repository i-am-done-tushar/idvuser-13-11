import { useState } from "react";
import { FormData } from "@shared/templates";
import {
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidDOB,
  isValidAddress,
  isValidPostalCode,
  isValidPhoneForCountry,
  COUNTRY_PHONE_RULES,
  digitsOnly,
} from "@/lib/validation";

interface PersonalInformationFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  onSendEmailOTP: () => void;
  onSendPhoneOTP: () => void;
  fieldConfig?: {
    email?: boolean;
    gender?: boolean;
    lastName?: boolean;
    firstName?: boolean;
    dateOfBirth?: boolean;
    currentAddress?: boolean;
    permanentAddress?: boolean;
    phoneNumber?: boolean;
    middleName?: boolean;
    city?: boolean;
    postalCode?: boolean;
  };
}

export function PersonalInformationForm({
  formData,
  setFormData,
  isEmailVerified,
  isPhoneVerified,
  onSendEmailOTP,
  onSendPhoneOTP,
  fieldConfig = {}, // Default to empty object
}: PersonalInformationFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  // Helper function to check if a field should be displayed
  const shouldShowField = (fieldName: string): boolean => {
    // If no fieldConfig provided, show all fields (backward compatibility)
    if (!fieldConfig || Object.keys(fieldConfig).length === 0) {
      return true;
    }
    
    // Map form field names to config field names
    const fieldMapping: Record<string, string> = {
      firstName: 'firstName',
      lastName: 'lastName', 
      email: 'email',
      gender: 'gender',
      dateOfBirth: 'dateOfBirth',
      address: 'currentAddress',
      city: 'currentAddress', // City is part of current address
      postalCode: 'currentAddress', // Postal code is part of current address
      permanentAddress: 'permanentAddress',
      permanentCity: 'permanentAddress', // Permanent city is part of permanent address
      permanentPostalCode: 'permanentAddress', // Permanent postal code is part of permanent address
      phoneNumber: 'phoneNumber',
      countryCode: 'phoneNumber', // Country code is part of phone number
      middleName: 'middleName'
    };
    
    const configKey = fieldMapping[fieldName];
    if (!configKey) return true; // Show if not configured
    
    return fieldConfig[configKey as keyof typeof fieldConfig] === true;
  };

  const updateField = (field: keyof FormData, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFormData({ ...formData, [field]: value });
  };

  const validateField = (field: keyof FormData) => {
    const value = (formData[field] || "").toString();
    let error: string | undefined = undefined;

    switch (field) {
      case "firstName":
      case "lastName":
        if (!isValidName(value)) error = "Enter at least 2 valid letters.";
        break;
      case "dateOfBirth":
        if (!isValidDOB(value))
          error = "Enter a valid DOB (DD/MM/YYYY). You must be at least 18.";
        break;
      case "email":
        if (!isValidEmail(value)) error = "Please enter a valid email address.";
        break;
      case "countryCode":
        if (!formData.countryCode) error = "Please select a country code.";
        break;
      case "phoneNumber":
        if (!isValidPhoneForCountry(formData.countryCode, value))
          error = "Please enter a valid phone number.";
        break;
      case "address":
      case "permanentAddress":
        if (!isValidAddress(value))
          error = "Enter your address (at least 5 characters).";
        break;
      case "city":
      case "permanentCity":
        if (!value || value.trim().length < 2) error = "Enter your city.";
        break;
      case "postalCode":
      case "permanentPostalCode":
        if (!isValidPostalCode(value)) error = "Enter a valid postal code.";
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateAll = () => {
    const fields: (keyof FormData)[] = [
      "firstName",
      "lastName",
      "dateOfBirth",
      "email",
      "countryCode",
      "phoneNumber",
      "address",
      "city",
      "postalCode",
      "permanentAddress",
      "permanentCity",
      "permanentPostalCode",
    ];
    return fields.every((f) => validateField(f));
  };

  // DOB helpers
  const formatDOBToInput = (dob: string) => {
    if (!dob) return "";
    const m = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return "";
    const [_, day, month, year] = m;
    return `${year}-${month}-${day}`;
  };

  const parseInputDateToDOB = (value: string) => {
    if (!value) return "";
    const parts = value.split("-");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  };

  return (
    <div className="flex flex-col items-start self-stretch">
      <div className="flex flex-col items-start gap-6 self-stretch">
        {/* Name Fields Row */}
        <div className="flex flex-col items-start self-stretch">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 self-stretch">
            {/* First Name */}
            {shouldShowField('firstName') && (
              <div className="flex flex-col items-start flex-1 w-full">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                    First Name
                  </div>
                </div>

                <div
                  className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.firstName ? "border-destructive" : "border-input-border"} bg-background`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      placeholder="Enter Name"
                      value={formData.firstName}
                      onChange={(e) =>
                        updateField(
                          "firstName",
                          e.target.value.replace(/[^\p{L}]/gu, ""),
                        )
                      }
                      onBlur={() => validateField("firstName")}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={
                        errors.firstName ? "err-firstName" : undefined
                      }
                      className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                    />
                  </div>
                </div>
                {errors.firstName && (
                  <div
                    id="err-firstName"
                    role="alert"
                    className="text-destructive text-[12px] mt-1"
                  >
                    {errors.firstName}
                  </div>
                )}
              </div>
            )}

            {/* Last Name */}
            {shouldShowField('lastName') && (
            <div className="flex flex-col items-start flex-1 w-full">
              <div className="flex pb-2 items-start gap-2 self-stretch">
                <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                  Last Name
                </div>
              </div>

              <div
                className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.lastName ? "border-destructive" : "border-input-border"} bg-background`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    placeholder="Enter Your Full Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      updateField(
                        "lastName",
                        e.target.value.replace(/[^\p{L}]/gu, ""),
                      )
                    }
                    onBlur={() => validateField("lastName")}
                    aria-invalid={!!errors.lastName}
                    aria-describedby={
                      errors.lastName ? "err-lastName" : undefined
                    }
                    className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                  />
                </div>
              </div>
              {errors.lastName && (
                <div
                  id="err-lastName"
                  role="alert"
                  className="text-destructive text-[12px] mt-1"
                >
                  {errors.lastName}
                </div>
              )}
            </div>
            )}
          </div>

          {/* Middle Name and DOB */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 self-stretch mt-6">
            {shouldShowField('middleName') && (
              <div className="flex flex-col items-start flex-1 w-full">
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
                      onChange={(e) => updateField("middleName", e.target.value)}
                      className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                    />
                  </div>
                </div>
              </div>
            )}

            {shouldShowField('dateOfBirth') && (
              <div className="flex w-full sm:flex-1 flex-col items-start">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                    Date Of Birth
                  </div>
                </div>

                <div
                  className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.dateOfBirth ? "border-destructive" : "border-input-border"} bg-background`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="date"
                      placeholder="DD/MM/YYYY"
                      value={formatDOBToInput(formData.dateOfBirth)}
                      onChange={(e) =>
                        updateField(
                          "dateOfBirth",
                          parseInputDateToDOB(e.target.value),
                        )
                      }
                      onBlur={() => validateField("dateOfBirth")}
                      aria-invalid={!!errors.dateOfBirth}
                      aria-describedby={
                        errors.dateOfBirth ? "err-dateOfBirth" : undefined
                      }
                      className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                    />
                  </div>
                </div>
                {errors.dateOfBirth && (
                  <div
                    id="err-dateOfBirth"
                    role="alert"
                    className="text-destructive text-[12px] mt-1"
                  >
                    {errors.dateOfBirth}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Email & Phone */}
          <div className="flex flex-col items-start gap-6 self-stretch mt-6">
            <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6 self-stretch">
              {shouldShowField('email') && (
                <div className="flex flex-col items-start flex-1 w-full">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 font-roboto text-[13px] font-normal leading-[18px]">
                    <span className="text-text-primary">Email </span>
                    <span className="text-destructive">*</span>
                  </div>
                </div>

                <div
                  className={`flex flex-col items-start gap-1 self-stretch ${errors.email ? "" : ""}`}
                >
                  <div
                    className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.email ? "border-destructive" : "border-input-border"} bg-background`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="email"
                        placeholder="Enter Your Email Address"
                        value={formData.email}
                        onChange={(e) =>
                          updateField("email", e.target.value.trim())
                        }
                        onBlur={() => validateField("email")}
                        aria-invalid={!!errors.email}
                        aria-describedby={
                          errors.email ? "err-email" : undefined
                        }
                        className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                      />
                    </div>
                    <button
                      onClick={onSendEmailOTP}
                      disabled={
                        !isValidEmail(formData.email) || isEmailVerified
                      }
                      aria-disabled={
                        !isValidEmail(formData.email) || isEmailVerified
                      }
                      className={`flex h-7 py-[9px] px-3 justify-center items-center gap-2 rounded bg-background ${!isValidEmail(formData.email) || isEmailVerified ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="text-primary font-figtree text-[12px] font-normal">
                        {isEmailVerified ? "Verified" : "Send OTP"}
                      </span>
                    </button>
                  </div>
                  {errors.email ? (
                    <div
                      id="err-email"
                      role="alert"
                      className="text-destructive text-[12px] mt-1"
                    >
                      {errors.email}
                    </div>
                  ) : (
                    !isEmailVerified && (
                      <div className="text-text-muted text-[12px] mt-1">
                        Email verification is required to continue.
                      </div>
                    )
                  )}
                </div>
              </div>
              )}

              {shouldShowField('phoneNumber') && (
                <div className="flex flex-col items-start flex-1 w-full">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 font-roboto text-[13px] font-normal leading-[18px]">
                    <span className="text-text-primary">Phone Number </span>
                    <span className="text-destructive">*</span>
                  </div>
                </div>

                <div className={`flex flex-col items-start gap-1 self-stretch`}>
                  <div
                    className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.phoneNumber || errors.countryCode ? "border-destructive" : "border-input-border"} bg-background`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        value={formData.countryCode}
                        onChange={(e) =>
                          updateField("countryCode", e.target.value)
                        }
                        onBlur={() => validateField("countryCode")}
                        aria-invalid={!!errors.countryCode}
                        aria-describedby={
                          errors.countryCode ? "err-countryCode" : undefined
                        }
                        className="text-text-muted font-roboto text-[13px] font-normal leading-5 bg-transparent outline-none border-r border-input-border pr-2 mr-2 w-20 flex-none sm:w-auto"
                      >
                        <option value="">Select</option>
                        {COUNTRY_PHONE_RULES.map((c) => (
                          <option
                            key={c.dial}
                            value={c.dial}
                          >{`${c.dial} (${c.name})`}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="Enter Your Mobile Number"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          updateField("phoneNumber", digitsOnly(e.target.value))
                        }
                        onBlur={() => validateField("phoneNumber")}
                        aria-invalid={!!errors.phoneNumber}
                        aria-describedby={
                          errors.phoneNumber ? "err-phoneNumber" : undefined
                        }
                        className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                      />
                    </div>
                    <button
                      onClick={onSendPhoneOTP}
                      disabled={
                        !isValidPhoneForCountry(
                          formData.countryCode,
                          formData.phoneNumber,
                        ) || isPhoneVerified
                      }
                      aria-disabled={
                        !isValidPhoneForCountry(
                          formData.countryCode,
                          formData.phoneNumber,
                        ) || isPhoneVerified
                      }
                      className={`flex h-7 py-[9px] px-3 justify-center items-center gap-2 rounded bg-background ${!isValidPhoneForCountry(formData.countryCode, formData.phoneNumber) || isPhoneVerified ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="text-primary font-figtree text-[12px] font-normal">
                        {isPhoneVerified ? "Verified" : "Send OTP"}
                      </span>
                    </button>
                  </div>
                  {errors.countryCode ? (
                    <div
                      id="err-countryCode"
                      role="alert"
                      className="text-destructive text-[12px] mt-1"
                    >
                      {errors.countryCode}
                    </div>
                  ) : errors.phoneNumber ? (
                    <div
                      id="err-phoneNumber"
                      role="alert"
                      className="text-destructive text-[12px] mt-1"
                    >
                      {errors.phoneNumber}
                    </div>
                  ) : !isPhoneVerified ? (
                    <div className="text-text-muted text-[12px] mt-1">
                      Phone number verification is required to continue.
                    </div>
                  ) : null}
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Gender */}
          {shouldShowField('gender') && (
            <div className="flex w-full items-start gap-4 lg:gap-6 mt-6">
            <div className="flex w-full lg:w-[458px] h-auto lg:h-14 items-start gap-4 lg:gap-6 flex-shrink-0">
              <div className="flex w-full h-auto lg:h-14 flex-col items-start flex-1">
                <div className="flex pb-2 items-start gap-2 self-stretch">
                  <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                    Gender
                  </div>
                </div>
                <div className="flex flex-wrap items-start gap-2 sm:gap-3">
                  {["Male", "Female", "Non-Binary", "Prefer Not To Say"].map(
                    (option) => (
                      <div
                        key={option}
                        className="flex h-[38px] py-2 pr-2 items-center gap-2 rounded-full"
                      >
                        <div className="w-4 h-4 rounded-full border-[0.667px] border-step-inactive-border bg-background relative">
                          <input
                            type="radio"
                            name="gender"
                            value={option}
                            checked={formData.gender === option}
                            onChange={(e) =>
                              updateField("gender", e.target.value)
                            }
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
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Current Address Section */}
          {shouldShowField('currentAddress') && (
            <div className="flex flex-col items-start gap-4 self-stretch w-full mt-6">
              <div className="flex pb-1 flex-col items-start gap-1 self-stretch">
                <div className="text-text-primary font-roboto text-[16px] font-bold leading-[26px]">
                  Current Address{" "}
                  <span className="font-normal text-[13px] text-text-muted">
                    (as per ID)
                  </span>
                </div>
                <div className="self-stretch text-text-muted font-roboto text-[13px] font-normal leading-5">
                  Enter your current residential address exactly as shown on your
                  government-issued ID.
                </div>
              </div>

              <div className="flex flex-col items-start self-stretch w-full">
                <div className="flex h-auto items-start gap-4 self-stretch w-full">
                  <div className="flex flex-col items-start flex-1 w-full">
                    <div className="flex pb-2 items-start gap-2 self-stretch">
                      <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                        Current Address
                      </div>
                    </div>
                    <div
                      className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.address ? "border-destructive" : "border-input-border"} bg-background w-full`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="e.g 123 MG Road, Shastri Nagar, Near City Park"
                          value={formData.address}
                          onChange={(e) => updateField("address", e.target.value)}
                          onBlur={() => validateField("address")}
                          aria-invalid={!!errors.address}
                          aria-describedby={
                            errors.address ? "err-address" : undefined
                          }
                          className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                        />
                      </div>
                    </div>
                    {errors.address && (
                      <div
                        id="err-address"
                        role="alert"
                        className="text-destructive text-[12px] mt-1"
                      >
                        {errors.address}
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Address City and Postal Code Row */}
                <div className="inline-flex flex-col sm:flex-row items-start gap-4 sm:gap-6 w-full mt-6">
                  <div className="flex flex-col items-start w-full sm:flex-1">
                    <div className="flex pb-2 items-start gap-2 self-stretch">
                      <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                        City
                      </div>
                    </div>
                    <div
                      className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.city ? "border-destructive" : "border-input-border"} bg-background w-full`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="e.g Mumbai"
                          value={formData.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          onBlur={() => validateField("city")}
                          aria-invalid={!!errors.city}
                          aria-describedby={errors.city ? "err-city" : undefined}
                          className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                        />
                      </div>
                    </div>
                    {errors.city && (
                      <div
                        id="err-city"
                        role="alert"
                        className="text-destructive text-[12px] mt-1"
                      >
                        {errors.city}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start w-full sm:flex-1">
                    <div className="flex pb-2 items-start gap-2 self-stretch">
                      <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                        Postal Code
                      </div>
                    </div>
                    <div
                      className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.postalCode ? "border-destructive" : "border-input-border"} bg-background w-full`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="e.g 432001"
                          value={formData.postalCode}
                          onChange={(e) =>
                            updateField("postalCode", e.target.value)
                          }
                          onBlur={() => validateField("postalCode")}
                          aria-invalid={!!errors.postalCode}
                          aria-describedby={
                            errors.postalCode ? "err-postalCode" : undefined
                          }
                          className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                        />
                      </div>
                    </div>
                    {errors.postalCode && (
                      <div
                        id="err-postalCode"
                        role="alert"
                        className="text-destructive text-[12px] mt-1"
                      >
                        {errors.postalCode}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Permanent Address Section */}
          {shouldShowField('permanentAddress') && (
            <div className="flex flex-col items-start gap-4 self-stretch w-full mt-6">
              <div className="flex pb-1 flex-col items-start gap-1 self-stretch">
                <div className="text-text-primary font-roboto text-[16px] font-bold leading-[26px]">
                  Permanent Address{" "}
                  <span className="font-normal text-[13px] text-text-muted">
                    (as per ID)
                  </span>
                </div>
                <div className="self-stretch text-text-muted font-roboto text-[13px] font-normal leading-5">
                  Enter your permanent address exactly as shown on your
                  government-issued ID.
                </div>
              </div>

              <div className="flex flex-col items-start self-stretch w-full">
                <div className="flex h-auto items-start gap-4 self-stretch w-full">
                  <div className="flex flex-col items-start flex-1 w-full">
                    <div className="flex pb-2 items-start gap-2 self-stretch">
                      <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                        Permanent Address
                      </div>
                    </div>
                    <div
                      className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.permanentAddress ? "border-destructive" : "border-input-border"} bg-background w-full`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="e.g 456 Park Street, Gandhi Nagar, Near Mall"
                          value={formData.permanentAddress}
                          onChange={(e) => updateField("permanentAddress", e.target.value)}
                          onBlur={() => validateField("permanentAddress")}
                          aria-invalid={!!errors.permanentAddress}
                          aria-describedby={
                            errors.permanentAddress ? "err-permanentAddress" : undefined
                          }
                          className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                        />
                      </div>
                    </div>
                    {errors.permanentAddress && (
                      <div
                        id="err-permanentAddress"
                        role="alert"
                        className="text-destructive text-[12px] mt-1"
                      >
                        {errors.permanentAddress}
                      </div>
                    )}
                  </div>
                </div>

                {/* Permanent Address City and Postal Code Row */}
                <div className="inline-flex flex-col sm:flex-row items-start gap-4 sm:gap-6 w-full mt-6">
                  <div className="flex flex-col items-start w-full sm:flex-1">
                    <div className="flex pb-2 items-start gap-2 self-stretch">
                      <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                        Permanent City
                      </div>
                    </div>
                    <div
                      className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.permanentCity ? "border-destructive" : "border-input-border"} bg-background w-full`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="e.g Delhi"
                          value={formData.permanentCity}
                          onChange={(e) => updateField("permanentCity", e.target.value)}
                          onBlur={() => validateField("permanentCity")}
                          aria-invalid={!!errors.permanentCity}
                          aria-describedby={errors.permanentCity ? "err-permanentCity" : undefined}
                          className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                        />
                      </div>
                    </div>
                    {errors.permanentCity && (
                      <div
                        id="err-permanentCity"
                        role="alert"
                        className="text-destructive text-[12px] mt-1"
                      >
                        {errors.permanentCity}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start w-full sm:flex-1">
                    <div className="flex pb-2 items-start gap-2 self-stretch">
                      <div className="flex h-2.5 flex-col justify-center flex-1 text-text-primary font-roboto text-[13px] font-normal leading-[18px]">
                        Permanent Postal Code
                      </div>
                    </div>
                    <div
                      className={`flex h-[38px] py-[15px] px-3 justify-between items-center self-stretch rounded border ${errors.permanentPostalCode ? "border-destructive" : "border-input-border"} bg-background w-full`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="e.g 110001"
                          value={formData.permanentPostalCode}
                          onChange={(e) =>
                            updateField("permanentPostalCode", e.target.value)
                          }
                          onBlur={() => validateField("permanentPostalCode")}
                          aria-invalid={!!errors.permanentPostalCode}
                          aria-describedby={
                            errors.permanentPostalCode ? "err-permanentPostalCode" : undefined
                          }
                          className="text-text-muted font-roboto text-[13px] font-normal leading-5 w-full bg-transparent border-none outline-none placeholder:text-text-muted"
                        />
                      </div>
                    </div>
                    {errors.permanentPostalCode && (
                      <div
                        id="err-permanentPostalCode"
                        role="alert"
                        className="text-destructive text-[12px] mt-1"
                      >
                        {errors.permanentPostalCode}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
