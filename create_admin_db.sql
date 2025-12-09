-- Add is_admin to profiles if it doesn't exist
alter table profiles add column if not exists is_admin boolean default false;

-- Create official_templates table
create table if not exists official_templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  thumbnail_url text,
  cover_url text,
  video_url text,
  prompt text,
  category text,
  ratio text,
  rating float default 5.0,
  likes int default 0,
  is_premium boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table official_templates enable row level security;

-- Policies for official_templates
-- 1. Everyone can view
create policy "Public can view official templates"
  on official_templates for select
  using ( true );

-- 2. Only Admins can insert/update/delete
create policy "Admins can insert official templates"
  on official_templates for insert
  with check ( 
    exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
  );

create policy "Admins can update official templates"
  on official_templates for update
  using ( 
    exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
  );

create policy "Admins can delete official templates"
  on official_templates for delete
  using ( 
    exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
  );

-- Function to check if user is admin (helper for frontend RLS check if needed, mainly relying on policies above)
