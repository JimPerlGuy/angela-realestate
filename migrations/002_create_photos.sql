CREATE TABLE IF NOT EXISTS photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "listingId"  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  "s3Key"      TEXT NOT NULL,
  url          TEXT NOT NULL,
  "isPrimary"  BOOLEAN NOT NULL DEFAULT FALSE,
  "uploadedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS photos_listing_id_idx ON photos ("listingId");
