-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
-- This table mirrors the auth.users table but holds our app-specific data.
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  credits integer default 300,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Trigger: Automatically create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. GENERATIONS (Audit Log)
-- Tracks every video generation request and result
create table public.generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  prompt text not null,
  aspect_ratio text not null,
  image_url text, -- Original uploaded image
  video_url text, -- Result video from Google
  status text default 'pending', -- pending, success, failed
  cost_credits integer default 10,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Generations
alter table public.generations enable row level security;
create policy "Users can view own generations" on generations for select using ( auth.uid() = user_id );
create policy "Users can insert own generations" on generations for insert with check ( auth.uid() = user_id );
-- Only Edge Functions (Service Role) should update status, but for MVP user might update if we do client-side polling (not rec for prod but ok for now)


-- 3. SAVED TEMPLATES (Favorites)
create table public.saved_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  template_id text not null, -- The string ID from our frontend constants
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, template_id)
);

-- RLS: Saved Templates
alter table public.saved_templates enable row level security;
create policy "Users can manage own saved templates" on saved_templates 
  for all using ( auth.uid() = user_id );


-- 4. CUSTOM TEMPLATES (User Uploaded)
create table public.custom_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  label text not null,
  cover_url text not null, -- Input Image
  video_url text not null, -- Generated Result
  prompt text,
  ratio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Custom Templates
alter table public.custom_templates enable row level security;
create policy "Users can manage own custom templates" on custom_templates 
  for all using ( auth.uid() = user_id );
