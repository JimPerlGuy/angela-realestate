-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  "contactType" VARCHAR(100),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create market_updates table
CREATE TABLE IF NOT EXISTS market_updates (
  id SERIAL PRIMARY KEY,
  "sourceName" VARCHAR(255) NOT NULL,
  "date" DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  "previewText" TEXT,
  "sourceUrl" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_testimonials_created ON testimonials("createdAt");
CREATE INDEX idx_market_updates_date ON market_updates("date");
