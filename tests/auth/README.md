# Magic Link Authentication Tests

This directory contains E2E tests for the magic link authentication flow.

## Test File: `magic-link.spec.ts`

### Overview

The magic link authentication tests cover the complete user flow for passwordless authentication using email-based magic links. These tests assume the magic link functionality has been implemented in the authentication system.

### Test Coverage

#### Core Functionality
- **Navigation**: Tests that users can access the sign-in page and see the magic link form
- **Valid Submissions**: Tests successful magic link requests with valid email addresses
- **Validation**: Tests form validation for invalid and empty email addresses
- **Success States**: Verifies that success messages appear after submission

#### Error Scenarios
- **Network Errors**: Tests graceful handling of network failures
- **Server Errors**: Tests handling of 500-level server errors
- **Rate Limiting**: Tests handling of 429 Too Many Requests responses
- **Loading States**: Tests that UI is properly disabled during requests

#### User Experience
- **Modal Management**: Tests opening, closing, and resetting of the auth modal
- **Form Reset**: Tests that form state is cleared when modal is reopened
- **Loading States**: Tests button and input disabled states during submission

#### Responsive Behavior
- **Mobile Viewport**: Tests functionality on mobile devices (375px width)
- **Tablet Viewport**: Tests functionality on tablet devices (768px width)
- **Touch Targets**: Verifies minimum 44px touch target sizes for mobile
- **Accessibility**: Tests focus management and keyboard navigation

### Prerequisites

Before running these tests, ensure that:

1. **Magic Link Implementation**: The auth system must support magic link authentication
2. **UI Components**: The following UI elements must be present:
   - "Sign in with magic link" button/link in the auth modal
   - Email input field with proper labeling
   - "Send Magic Link" submit button
   - Success and error message displays
3. **API Endpoints**: The `/auth/v1/otp` endpoint must be implemented
4. **Responsive Design**: Touch-friendly design for mobile viewports

### Running the Tests

```bash
# Run all magic link tests
npx playwright test tests/auth/magic-link.spec.ts

# Run with UI mode for debugging
npx playwright test tests/auth/magic-link.spec.ts --ui

# Run on specific browser
npx playwright test tests/auth/magic-link.spec.ts --project=chromium

# Run specific test
npx playwright test tests/auth/magic-link.spec.ts -g "should successfully submit"
```

### Implementation Notes

These tests are designed to work with the existing authentication modal system. They assume:

1. **Modal-based Authentication**: Tests expect the magic link form to be part of the existing auth modal
2. **Supabase Integration**: API routes are expected to match Supabase's OTP authentication endpoints
3. **Toast Notifications**: Success/error messages may use the existing toast system
4. **Responsive Design**: Tests validate touch-friendly design following existing patterns

### Test Data

- **Valid Email**: `test@example.com`
- **Invalid Emails**: Various malformed email formats for validation testing
- **Viewport Sizes**: 
  - Mobile: 375x667px
  - Tablet: 768x1024px
  - Desktop: Default Playwright sizes

### Expected Behavior

1. **Sign-in Flow**: User clicks "Sign In" → Modal opens → User selects magic link option
2. **Form Submission**: User enters email → Clicks "Send Magic Link" → Success message appears
3. **Email Delivery**: Success message includes the email address for confirmation
4. **Error Handling**: Clear error messages for validation and network issues
5. **Mobile Experience**: Full-screen modal with touch-friendly controls