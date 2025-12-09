-- FIX: Allow users to create and manage their own profiles
-- Issue: Existing users couldn't create a profile record because INSERT permission was missing.

-- 1. Drop restricted policies
drop policy if exists "Users can update own profile." on profiles;

-- 2. Add full permission policy (Insert, Update, Select) for own data
create policy "Users can manage own profile" on profiles 
for all 
using ( auth.uid() = id );

-- 3. Allow inserting generations (Just in case it was missed or restrictive)
drop policy if exists "Users can insert own generations" on generations;
create policy "Users can insert own generations" on generations 
for insert 
with check ( auth.uid() = user_id );

-- 4. Allow updating generations (e.g. for simple status updates if we do client-side)
create policy "Users can update own generations" on generations 
for update
using ( auth.uid() = user_id );
