export interface PasswordStrength {
  score: number; // 0-4, where 0 is weak and 4 is strong
  label: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

export function validatePassword(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: PASSWORD_REQUIREMENTS.uppercase.test(password),
    hasNumber: PASSWORD_REQUIREMENTS.number.test(password),
    hasSpecialChar: PASSWORD_REQUIREMENTS.specialChar.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  let score = 0;
  let label = "Weak";
  let color = "bg-red-500";

  if (metRequirements === 0) {
    score = 0;
    label = "Weak";
    color = "bg-red-500";
  } else if (metRequirements === 1) {
    score = 1;
    label = "Weak";
    color = "bg-red-500";
  } else if (metRequirements === 2) {
    score = 2;
    label = "Fair";
    color = "bg-yellow-500";
  } else if (metRequirements === 3) {
    score = 3;
    label = "Good";
    color = "bg-blue-500";
  } else {
    score = 4;
    label = "Strong";
    color = "bg-green-500";
  }

  return {
    score,
    label,
    color,
    requirements,
  };
}

export function isPasswordValid(password: string): boolean {
  const validation = validatePassword(password);
  return (
    validation.requirements.minLength &&
    validation.requirements.hasUppercase &&
    validation.requirements.hasNumber &&
    validation.requirements.hasSpecialChar
  );
}

export function passwordsMatch(
  password: string,
  confirmPassword: string,
): boolean {
  return password === confirmPassword && password.length > 0;
}
