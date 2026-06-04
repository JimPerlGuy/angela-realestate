-- Create agents table for extensibility to multiple realtors
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  bio TEXT,
  "photoUrl" TEXT,
  "yearsExperience" INTEGER,
  "propertiesSold" INTEGER,
  "activeMarkets" TEXT,
  "isPrimary" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for primary agent lookup
CREATE INDEX IF NOT EXISTS idx_agents_primary ON agents("isPrimary");
