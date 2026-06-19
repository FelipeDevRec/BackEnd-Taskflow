-- Run these statements in the Supabase SQL editor (Project > SQL)
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  completed boolean DEFAULT false,
  "userId" text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);
