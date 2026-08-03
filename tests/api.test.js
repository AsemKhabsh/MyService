/**
 * Integration Test Suite for My Services API Logic
 * Run using: node tests/api.test.js
 */

import { RegisterSchema, LoginSchema, ServiceSchema } from "../src/utils/validation.js";
import { signToken, verifyToken } from "../src/lib/jwt.js";
import { generateReceiptData } from "../src/lib/receipt.js";

function runTests() {
  console.log("=== Running My Services Integration Tests ===\n");
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
    }
  }

  // 1. Zod Auth Validation Tests
  const validRegister = RegisterSchema.safeParse({
    name: "Test User",
    email: "test@example.com",
    password: "securepassword123",
  });
  assert(validRegister.success, "RegisterSchema validates correct payload");

  const invalidEmailRegister = RegisterSchema.safeParse({
    name: "Test User",
    email: "invalid-email",
    password: "123",
  });
  assert(!invalidEmailRegister.success, "RegisterSchema rejects invalid email and short password");

  // 2. Service Category Validation Test
  const validService = ServiceSchema.safeParse({
    title: "Full Stack Next.js Web Application",
    shortDescription: "Complete custom Web app development using Next.js and MongoDB.",
    description: "Full service software development with responsive UI, authentication, database connection, and deployment.",
    price: 499,
    category: "Full Stack Development",
    image: "https://res.cloudinary.com/demo/image/upload/v1571218039/sample.jpg",
    deliveryTime: 5,
    revisions: 3,
  });
  assert(validService.success, "ServiceSchema validates predefined category 'Full Stack Development'");

  const invalidCategoryService = ServiceSchema.safeParse({
    title: "Bad Category Service",
    shortDescription: "Short description text here.",
    description: "Detailed description text goes here.",
    price: 100,
    category: "Random Custom Category Free Text", // Must be rejected!
    image: "https://res.cloudinary.com/demo/image/upload/v1571218039/sample.jpg",
    deliveryTime: 2,
  });
  assert(!invalidCategoryService.success, "ServiceSchema strictly rejects arbitrary free-text category");

  // 3. JWT Signing & Verification Test
  const tokenPayload = { id: "507f1f77bcf86cd799439011", role: "admin", email: "admin@example.com" };
  const token = signToken(tokenPayload);
  const decoded = verifyToken(token);

  assert(decoded && decoded.role === "admin", "JWT token correctly signs and verifies admin role payload");

  // 4. Receipt Generator & Payment Metadata Test
  const receipt = generateReceiptData({
    paymentId: "pi_3MtwBwLkdIwHu7ix28a3tCsub",
    request: { _id: "607f1f77bcf86cd799439022" },
    user: { name: "Alice Customer", email: "alice@example.com" },
    amount: 150.0,
    currency: "usd",
    stripePaymentIntent: "pi_3MtwBwLkdIwHu7ix28a3tCsub",
  });

  assert(receipt.receiptNumber.startsWith("REC-"), "Receipt generator produces REC- formatted identifier");
  assert(receipt.receiptUrl.includes("/dashboard/requests/"), "Receipt URL links to request details");

  console.log(`\nTest Summary: ${passed}/${total} tests passed.`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
