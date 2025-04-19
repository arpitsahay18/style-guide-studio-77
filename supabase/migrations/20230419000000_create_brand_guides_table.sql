
-- Create brand_guides table to store user guides
CREATE TABLE brand_guides (
  id UUID PRIMARY KEY,
  session_id TEXT NOT NULL,
  guide_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for efficient querying by session_id
CREATE INDEX idx_brand_guides_session_id ON brand_guides(session_id);

-- Create a function to clean up expired guides
CREATE OR REPLACE FUNCTION cleanup_expired_guides()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM brand_guides WHERE expires_at < NOW();
END;
$$;

-- Create a cron job to run the cleanup function daily
SELECT cron.schedule(
  'cleanup-expired-brand-guides',
  '0 0 * * *',  -- Run at midnight every day
  $$SELECT cleanup_expired_guides()$$
);

-- Enable Row Level Security
ALTER TABLE brand_guides ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous access
CREATE POLICY "Allow anonymous access to own guides"
  ON brand_guides
  USING (true)
  WITH CHECK (true);
