import validator from "validator";

/**
 * Sanitizes a string by trimming whitespace and escaping HTML
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return validator.escape(validator.trim(input));
}

/**
 * Validates and normalizes an email address
 */
export function validateEmail(email: string): { valid: boolean; email?: string; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const trimmedEmail = validator.trim(email).toLowerCase();

  if (!validator.isEmail(trimmedEmail)) {
    return { valid: false, error: "Invalid email address" };
  }

  // Additional security: check email length
  if (trimmedEmail.length > 254) {
    return { valid: false, error: "Email address is too long" };
  }

  return { valid: true, email: trimmedEmail };
}

/**
 * Validates and sanitizes a phone number
 */
export function validatePhone(phone: string): { valid: boolean; phone?: string; error?: string } {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "Phone number is required" };
  }

  const trimmedPhone = validator.trim(phone);

  // Allow common phone formats
  if (!validator.isMobilePhone(trimmedPhone, "any", { strictMode: false })) {
    return { valid: false, error: "Invalid phone number" };
  }

  return { valid: true, phone: trimmedPhone };
}

/**
 * Validates a name field (no special characters except hyphens, apostrophes, and spaces)
 */
export function validateName(name: string, fieldName: string = "Name"): { valid: boolean; name?: string; error?: string } {
  if (!name || typeof name !== "string") {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmedName = validator.trim(name);

  if (trimmedName.length < 1 || trimmedName.length > 100) {
    return { valid: false, error: `${fieldName} must be between 1 and 100 characters` };
  }

  // Allow letters, spaces, hyphens, apostrophes, and common characters
  // Using a simpler regex that works with ES5 target
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmedName)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }

  return { valid: true, name: sanitizeString(trimmedName) };
}

/**
 * Validates and sanitizes a password
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }

  if (password.length > 128) {
    return { valid: false, error: "Password is too long" };
  }

  return { valid: true };
}

/**
 * Validates and sanitizes address fields
 */
export function validateAddress(address: {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}): { valid: boolean; address?: any; error?: string } {
  const sanitized: any = {};

  // Address Line 1
  if (!address.addressLine1 || typeof address.addressLine1 !== "string") {
    return { valid: false, error: "Street address is required" };
  }
  sanitized.addressLine1 = sanitizeString(address.addressLine1);
  if (sanitized.addressLine1.length < 1 || sanitized.addressLine1.length > 200) {
    return { valid: false, error: "Street address must be between 1 and 200 characters" };
  }

  // Address Line 2 (optional)
  if (address.addressLine2) {
    sanitized.addressLine2 = sanitizeString(address.addressLine2);
    if (sanitized.addressLine2.length > 200) {
      return { valid: false, error: "Address line 2 is too long" };
    }
  }

  // City
  if (!address.city || typeof address.city !== "string") {
    return { valid: false, error: "City is required" };
  }
  sanitized.city = sanitizeString(address.city);
  if (sanitized.city.length < 1 || sanitized.city.length > 100) {
    return { valid: false, error: "City must be between 1 and 100 characters" };
  }

  // State
  if (!address.state || typeof address.state !== "string") {
    return { valid: false, error: "State is required" };
  }
  sanitized.state = validator.trim(address.state).toUpperCase();
  if (sanitized.state.length !== 2) {
    return { valid: false, error: "State must be a valid 2-letter code" };
  }

  // ZIP Code
  if (!address.zip || typeof address.zip !== "string") {
    return { valid: false, error: "ZIP code is required" };
  }
  sanitized.zip = validator.trim(address.zip);
  if (!/^\d{5}(-\d{4})?$/.test(sanitized.zip)) {
    return { valid: false, error: "ZIP code must be in format 12345 or 12345-6789" };
  }

  // Country (optional, defaults to US)
  sanitized.country = address.country ? sanitizeString(address.country) : "US";
  if (sanitized.country.length > 50) {
    return { valid: false, error: "Country name is too long" };
  }

  return { valid: true, address: sanitized };
}

/**
 * Validates and sanitizes event data
 */
export function validateEventData(data: {
  name: string;
  eventType?: string;
  customMessage?: string;
}): { valid: boolean; data?: any; error?: string } {
  const sanitized: any = {};

  // Event name
  if (!data.name || typeof data.name !== "string") {
    return { valid: false, error: "Event name is required" };
  }
  sanitized.name = sanitizeString(data.name);
  if (sanitized.name.length < 1 || sanitized.name.length > 200) {
    return { valid: false, error: "Event name must be between 1 and 200 characters" };
  }

  // Event type (optional)
  if (data.eventType) {
    const validTypes = ["wedding", "graduation", "birthday", "reunion", "holiday_cards", "other"];
    if (!validTypes.includes(data.eventType)) {
      return { valid: false, error: "Invalid event type" };
    }
    sanitized.eventType = data.eventType;
  }

  // Custom message (optional)
  if (data.customMessage) {
    sanitized.customMessage = sanitizeString(data.customMessage);
    if (sanitized.customMessage.length > 1000) {
      return { valid: false, error: "Custom message is too long (max 1000 characters)" };
    }
  }

  return { valid: true, data: sanitized };
}
