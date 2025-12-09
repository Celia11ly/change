-- Add badge column
alter table official_templates add column if not exists badge text; 
-- intended values: 'NEW', 'HOT', 'PRO' or null
