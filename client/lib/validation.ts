export function isValidName(name: string) {
  if (!name) return false;
  const trimmed = name.trim();
  // Only alphabetic letters, at least 2 characters. Uses Unicode property escapes to allow international letters.
  return /^\p{L}{2,}$/u.test(trimmed);
}

export function isValidEmail(email: string) {
  const trimmed = (email ?? "").trim();
  if (!trimmed) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(trimmed);
}

export const COUNTRY_PHONE_RULES = [
  { dial: "+91", name: "India", min: 10, max: 10 },
  { dial: "+1", name: "United States", min: 10, max: 10 },
  { dial: "+44", name: "United Kingdom", min: 10, max: 10 },
  { dial: "+61", name: "Australia", min: 9, max: 9 },
  { dial: "+49", name: "Germany", min: 10, max: 11 },
  { dial: "+33", name: "France", min: 9, max: 9 },
  { dial: "+65", name: "Singapore", min: 8, max: 8 },
  { dial: "+971", name: "United Arab Emirates", min: 9, max: 9 },
  { dial: "+55", name: "Brazil", min: 10, max: 11 },
  { dial: "+81", name: "Japan", min: 9, max: 10 },
] as const;

export function digitsOnly(input: string) {
  return (input ?? "").replace(/\D/g, "");
}

export function isValidPhone(phone: string) {
  // Kept for backward compatibility; assumes generic 10-digit rule
  const digits = digitsOnly(phone);
  return digits.length === 10;
}

export function isValidPhoneForCountry(countryDial: string, phone: string) {
  const digits = digitsOnly(phone);
  const rule = COUNTRY_PHONE_RULES.find((c) => c.dial === countryDial);
  if (!rule) {
    // default to reasonable E.164 local length range if unknown
    return digits.length >= 6 && digits.length <= 14;
  }
  return digits.length >= rule.min && digits.length <= rule.max;
}

export function parseDOB(dob: string): Date | null {
  // Expect DD/MM/YYYY
  const m = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const year = parseInt(m[3], 10);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day)
    return null;
  return d;
}

export function isValidDOB(dob: string, minAge = 18) {
  const d = parseDOB(dob);
  if (!d) return false;
  const now = new Date();
  if (d > now) return false;
  const age = getAge(d, now);
  return age >= minAge;
}

function getAge(birth: Date, now = new Date()) {
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function isValidPostalCode(code: string) {
  if (!code) return false;
  const digits = code.replace(/\s+/g, "");
  // Accept 5 or 6 digit postal codes
  return /^\d{5,6}$/.test(digits);
}

export function isValidAddress(addr: string) {
  if (!addr) return false;
  return addr.trim().length >= 5;
}
