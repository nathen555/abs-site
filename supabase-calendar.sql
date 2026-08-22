create table if not exists public.calendar_events (
    id text primary key,
    date date not null,
    title text not null,
    time text,
    details text,
    created_at timestamptz not null default now()
);

alter table public.calendar_events enable row level security;

create policy "Anyone can view calendar events"
    on public.calendar_events for select
    to anon
    using (true);

create policy "Anyone can add calendar events"
    on public.calendar_events for insert
    to anon
    with check (true);

create policy "Anyone can edit calendar events"
    on public.calendar_events for update
    to anon
    using (true)
    with check (true);

create policy "Anyone can delete calendar events"
    on public.calendar_events for delete
    to anon
    using (true);