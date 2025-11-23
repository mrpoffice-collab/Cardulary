/**
 * Environment variable validation
 * Call this at application startup to ensure all required environment variables are set
 */

interface EnvConfig {
  // Database
  DATABASE_URL?: string;

  // NextAuth
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;

  // Google OAuth
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;

  // Email (Resend)
  RESEND_API_KEY?: string;

  // SMS (Twilio)
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;

  // AI (Anthropic)
  ANTHROPIC_API_KEY?: string;

  // App
  NEXT_PUBLIC_APP_URL?: string;
}

const REQUIRED_ENV_VARS: (keyof EnvConfig)[] = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
];

const OPTIONAL_ENV_VARS: (keyof EnvConfig)[] = [
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RESEND_API_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "ANTHROPIC_API_KEY",
  "NEXT_PUBLIC_APP_URL",
];

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate NEXTAUTH_SECRET length (should be at least 32 characters)
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push("NEXTAUTH_SECRET must be at least 32 characters long");
  }

  // Validate URLs
  if (process.env.NEXTAUTH_URL) {
    try {
      new URL(process.env.NEXTAUTH_URL);
    } catch {
      errors.push("NEXTAUTH_URL must be a valid URL");
    }
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_APP_URL);
    } catch {
      errors.push("NEXT_PUBLIC_APP_URL must be a valid URL");
    }
  }

  // Warn about missing optional variables
  const missingOptional: string[] = [];
  for (const varName of OPTIONAL_ENV_VARS) {
    if (!process.env[varName]) {
      missingOptional.push(varName);
    }
  }

  if (missingOptional.length > 0) {
    console.warn(
      `[ENV WARNING] Missing optional environment variables: ${missingOptional.join(", ")}`
    );
    console.warn(
      "[ENV WARNING] Some features may not work without these variables"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate environment on application startup
 * Throws an error if validation fails
 */
export function validateEnvOrThrow(): void {
  const result = validateEnv();

  if (!result.valid) {
    console.error("[ENV ERROR] Environment validation failed:");
    result.errors.forEach((error) => console.error(`  - ${error}`));
    throw new Error("Environment validation failed. Check the logs above.");
  }

  console.log("[ENV] Environment validation passed");
}
