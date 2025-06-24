-- Add Farcaster-specific columns to profiles table if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fid BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS farcaster_username TEXT;

-- Create index on fid for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_fid ON public.profiles(fid);

-- Update RLS policies to support Farcaster users
-- The existing policies should already work since they check auth.uid()
-- which will be set properly by our JWT re-signing process

-- Create a function to extract FID from JWT claims
CREATE OR REPLACE FUNCTION auth.fid()
RETURNS BIGINT
LANGUAGE sql 
STABLE
AS $$
  SELECT 
    COALESCE(
      (current_setting('request.jwt.claims', true)::json->>'fid')::BIGINT,
      (current_setting('request.jwt.claims', true)::json->'user_metadata'->>'fid')::BIGINT
    )
$$;

-- Create a policy that allows users to read profiles by FID
CREATE POLICY "Users can view profiles by FID" 
ON public.profiles
FOR SELECT
USING (
  -- Allow if it's the user's own profile
  auth.uid() = id
  OR 
  -- Allow if the FID matches (for Farcaster lookups)
  (auth.fid() IS NOT NULL AND fid = auth.fid())
  OR
  -- Keep existing public read access if any
  true
);

-- Ensure profiles table has proper RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create a trigger to automatically populate profile data for Farcaster users
CREATE OR REPLACE FUNCTION public.handle_new_farcaster_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only process if user has FID in metadata
  IF NEW.raw_user_meta_data->>'fid' IS NOT NULL THEN
    INSERT INTO public.profiles (id, fid, farcaster_username, created_at, updated_at)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'fid')::BIGINT,
      NEW.raw_user_meta_data->>'username',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) 
    DO UPDATE SET
      fid = EXCLUDED.fid,
      farcaster_username = EXCLUDED.farcaster_username,
      updated_at = NOW()
    WHERE profiles.fid IS NULL; -- Only update if FID wasn't set before
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new Farcaster users
DROP TRIGGER IF EXISTS on_auth_user_created_farcaster ON auth.users;
CREATE TRIGGER on_auth_user_created_farcaster
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_farcaster_user();

-- Add comment explaining the Farcaster integration
COMMENT ON COLUMN public.profiles.fid IS 'Farcaster ID (FID) for users authenticated via Farcaster';
COMMENT ON COLUMN public.profiles.farcaster_username IS 'Farcaster username for users authenticated via Farcaster';
COMMENT ON FUNCTION auth.fid() IS 'Extracts Farcaster ID from JWT claims for RLS policies';