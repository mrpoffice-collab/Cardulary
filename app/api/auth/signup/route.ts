import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateName, validateEmail, validatePassword } from "@/lib/utils/validation";
import { rateLimit, RATE_LIMITS, rateLimitResponse } from "@/lib/utils/rate-limit";

export async function POST(req: Request) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(req, RATE_LIMITS.signup);
  if (!rateLimitResult.success) {
    return rateLimitResponse(
      rateLimitResult.limit,
      rateLimitResult.remaining,
      rateLimitResult.reset
    );
  }

  try {
    const { name, email, password } = await req.json();

    // Validate and sanitize name
    const nameValidation = validateName(name, "Name");
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    // Validate and normalize email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Check if user already exists (generic error to prevent email enumeration)
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, emailValidation.email!),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Unable to create account. Please try a different email." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: nameValidation.name!,
        email: emailValidation.email!,
        password: hashedPassword,
      })
      .returning();

    return NextResponse.json(
      { message: "User created successfully", userId: newUser.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Unable to create account. Please try again later." },
      { status: 500 }
    );
  }
}
