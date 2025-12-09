-- Insert Others category if not exists
insert into template_categories (label) values ('Others') on conflict (label) do nothing;
