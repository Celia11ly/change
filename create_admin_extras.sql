-- 1. Create Categories Table
create table if not exists template_categories (
  id uuid default gen_random_uuid() primary key,
  label text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table template_categories enable row level security;

-- 3. Policies for categories (Same as policies for official_templates)
create policy "Public can view categories"
  on template_categories for select
  using ( true );

create policy "Admins can manage categories"
  on template_categories for all
  using ( 
    exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
  );

-- 4. Seed initial categories (from frontend hardcoded list)
insert into template_categories (label) values
('Cinematic'),
('Funny'),
('Fashion'),
('Classic'),
('Nature')
on conflict (label) do nothing;


-- 5. Add sort_order to official_templates
alter table official_templates add column if not exists sort_order int default 0;
