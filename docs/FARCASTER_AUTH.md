# Farcaster Authentication Integration

This document describes the Farcaster authentication implementation in EphemNotes, enabling users to sign in using their Farcaster identity.

## Overview

The integration supports two authentication flows:
1. **Quick Auth** - Simplified authentication for users within Farcaster frames/mini apps
2. **Sign In with Farcaster (SIWF)** - Full authentication flow for web users

## Architecture

### Components

#### 1. Farcaster Auth Context (`/src/contexts/FarcasterAuthContext.tsx`)
- Wraps the existing `AuthContext` with Farcaster-specific functionality
- Provides `quickAuth()` and `signInWithFarcaster()` methods
- Detects if the app is running inside a Farcaster frame
- Manages loading and error states

#### 2. Farcaster Auth Library (`/src/lib/farcaster-auth.ts`)
- Core utilities for Farcaster authentication
- JWT verification and validation
- Sign-in message generation and verification
- Helper functions for frame detection

#### 3. API Endpoint (`/src/app/api/auth/farcaster/route.ts`)
- Handles both Quick Auth and SIWF authentication requests
- Verifies Farcaster JWT tokens
- Re-signs tokens with Supabase JWT secret
- Creates or updates user profiles with Farcaster metadata

#### 4. Updated UI Components
- **AuthModal** - Added Farcaster sign-in button with conditional rendering
- Shows "Quick Auth with Farcaster" when in frame
- Shows "Sign in with Farcaster" when on web

### Authentication Flow

#### Quick Auth (In Farcaster Frame)
1. User clicks "Quick Auth with Farcaster" button
2. SDK retrieves auth token from Farcaster client
3. Token sent to `/api/auth/farcaster` endpoint
4. Server verifies token and extracts user info
5. JWT re-signed with Supabase secret
6. User session created in Supabase

#### Sign In with Farcaster (Web)
1. User clicks "Sign in with Farcaster" button
2. SDK initiates SIWF flow
3. User signs message in Farcaster app
4. Signed message sent to `/api/auth/farcaster` endpoint
5. Server verifies signature and creates session
6. User authenticated in Supabase

## Database Schema

### Profile Table Updates
```sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fid BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS farcaster_username TEXT;
```

### Row Level Security
- Added `auth.fid()` function to extract FID from JWT claims
- Updated RLS policies to support Farcaster user lookups
- Automatic profile creation for new Farcaster users

## Environment Configuration

Add the following to your `.env.local` file:
```bash
# JWT Secret (must match your Supabase JWT secret)
JWT_SECRET=your_supabase_jwt_secret
```

## Testing

### Unit Tests
- `farcaster-auth.test.ts` - Tests for auth utilities
- `FarcasterAuthContext.test.tsx` - Context provider tests
- `route.test.ts` - API endpoint tests
- `AuthModal.test.tsx` - UI component tests

### Integration Tests
- `farcaster-auth.test.tsx` - Full authentication flow tests

Run tests with:
```bash
npm test
```

## Security Considerations

1. **JWT Verification** - All tokens are verified before processing
2. **Signature Validation** - SIWF messages are cryptographically verified
3. **Token Expiration** - Tokens are checked for expiration
4. **Secure Session Management** - Sessions managed by Supabase with httpOnly cookies
5. **CSRF Protection** - Built into Supabase authentication

## Implementation Checklist

- [x] Install dependencies (`@farcaster/frame-sdk`, `jsonwebtoken`)
- [x] Create Farcaster auth context and provider
- [x] Implement Quick Auth flow
- [x] Implement Sign In with Farcaster flow
- [x] Create API endpoint for JWT verification
- [x] Update authentication UI components
- [x] Add mini app detection
- [x] Create comprehensive tests
- [x] Update Supabase RLS policies
- [x] Add environment configuration

## Future Enhancements

1. **Wallet Integration** - Add support for connected wallets
2. **Profile Enrichment** - Fetch additional profile data from Farcaster
3. **Social Features** - Enable following/followers based on Farcaster graph
4. **Frame Actions** - Add Farcaster-specific actions within frames

## Troubleshooting

### Common Issues

1. **"JWT_SECRET is not defined"**
   - Ensure `JWT_SECRET` is set in your environment variables
   - The secret must match your Supabase JWT secret

2. **"Failed to verify Farcaster token"**
   - Check that the Farcaster SDK is properly initialized
   - Ensure the user has granted necessary permissions

3. **"User profile not created"**
   - Verify the database migration has been applied
   - Check RLS policies allow profile creation

### Debug Mode

To enable debug logging, set:
```typescript
// In farcaster-auth.ts
const DEBUG = true
```

## References

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Farcaster Frame SDK](https://github.com/farcasterxyz/frame-sdk)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)