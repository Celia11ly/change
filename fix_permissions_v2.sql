-- FIX V2: Idempotent script (Works even if run multiple times)

-- 1. Profiles Table Policies
-- Explicitly drop potentially conflicting policies first
drop policy if exists "Users can update own profile." on profiles;
drop policy if exists "Users can manage own profile" on profiles;

-- Re-create the full permission policy
create policy "Users can manage own profile" on profiles 
for all 
using ( auth.uid() = id );


-- 2. Generations Table Policies
drop policy if exists "Users can insert own generations" on generations;
drop policy if exists "Users can update own generations" on generations;

create policy "Users can insert own generations" on generations 
for insert 
with check ( auth.uid() = user_id );

create policy "Users can update own generations" on generations 
for update
using ( auth.uid() = user_id );
