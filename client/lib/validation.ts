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

export function isValidPhone(phone: string) {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  // Accept 10 digit phone numbers (common format)
  return digits.length === 10;
}

export function parseDOB(dob: string): Date | null {
  // Expect DD/MM/YYYY
  const m = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const year = parseInt(m[3], 10);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
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
  const digits = code.replace(/\s+/g, '');
  // Accept 5 or 6 digit postal codes
  return /^\d{5,6}$/.test(digits);
}

export function isValidAddress(addr: string) {
  if (!addr) return false;
  return addr.trim().length >= 5;
}
