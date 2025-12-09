-- Create Credit Transactions Table
create table if not exists credit_transactions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) not null,
    amount integer not null, -- Positive for add, Negative for deduct
    type text not null, -- 'admin_topup', 'generation_cost', 'initial_grant', 'purchase'
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table credit_transactions enable row level security;

-- Users can view their own transactions
create policy "Users can view own transactions"
    on credit_transactions for select
    using ( auth.uid() = user_id );

-- Admins can view ALL transactions
create policy "Admins can view all transactions"
    on credit_transactions for select
    using ( 
        exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
    );

-- Admins can insert transactions (for top-ups)
create policy "Admins can insert transactions"
    on credit_transactions for insert
    with check (
        exists ( select 1 from profiles where id = auth.uid() and is_admin = true )
    );

-- Users can insert transactions (ONLY for generation costs or verified purchases - enforced by backend/RLS logic theoretically)
-- For this MVP, we allow users to insert their own records (e.g. generation cost) but in production this should be via Edge Functions.
create policy "Users can insert own transactions"
    on credit_transactions for insert
    with check ( auth.uid() = user_id );
