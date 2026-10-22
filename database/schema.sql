-- MEDICAMENTOS: qué toma el usuario
create table public.medicamentos (
  id          bigint generated always as identity primary key,
  usuario_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre      text not null check (char_length(trim(nombre)) > 0),
  dosis       text not null check (char_length(trim(dosis)) > 0),
  notas       text,
  foto_uri    text,
  creado_en   timestamptz not null default now()
);

-- HORARIOS: la regla de cuándo se toma
create table public.horarios (
  id              bigint generated always as identity primary key,
  usuario_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  medicamento_id  bigint not null references public.medicamentos (id) on delete cascade,
  tipo            text not null check (tipo in ('diario', 'intervalo')),
  horas           text[],
  cada_horas      integer check (cada_horas between 1 and 24),
  hora_inicio     text,
  fecha_inicio    date not null,
  fecha_fin       date,
  creado_en       timestamptz not null default now(),
  constraint horario_diario_valido check (
    tipo <> 'diario' or (horas is not null and cardinality(horas) > 0)
  ),
  constraint horario_intervalo_valido check (
    tipo <> 'intervalo' or (cada_horas is not null and hora_inicio is not null)
  ),
  constraint fechas_validas check (fecha_fin is null or fecha_fin >= fecha_inicio)
);

-- TOMAS: cada dosis concreta y su estado
create table public.tomas (
  id              bigint generated always as identity primary key,
  usuario_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  medicamento_id  bigint not null references public.medicamentos (id) on delete cascade,
  horario_id      bigint not null references public.horarios (id) on delete cascade,
  fecha_hora      timestamptz not null,
  estado          text not null default 'pendiente'
                  check (estado in ('pendiente', 'tomado', 'omitido')),
  confirmada_en   timestamptz,
  constraint toma_unica unique (horario_id, fecha_hora)
);

create index tomas_usuario_fecha_idx on public.tomas (usuario_id, fecha_hora);

-- GRANT: solo usuarios con sesión pueden usar las tablas
grant select, insert, update, delete on public.medicamentos to authenticated;
grant select, insert, update, delete on public.horarios     to authenticated;
grant select, insert, update, delete on public.tomas        to authenticated;

-- RLS: cada usuario solo ve y modifica SUS filas
alter table public.medicamentos enable row level security;
alter table public.horarios     enable row level security;
alter table public.tomas        enable row level security;

create policy "Usuarios ven sus medicamentos" on public.medicamentos
  for select to authenticated using (usuario_id = (select auth.uid()));
create policy "Usuarios crean sus medicamentos" on public.medicamentos
  for insert to authenticated with check (usuario_id = (select auth.uid()));
create policy "Usuarios editan sus medicamentos" on public.medicamentos
  for update to authenticated using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));
create policy "Usuarios eliminan sus medicamentos" on public.medicamentos
  for delete to authenticated using (usuario_id = (select auth.uid()));

create policy "Usuarios ven sus horarios" on public.horarios
  for select to authenticated using (usuario_id = (select auth.uid()));
create policy "Usuarios crean sus horarios" on public.horarios
  for insert to authenticated with check (usuario_id = (select auth.uid()));
create policy "Usuarios editan sus horarios" on public.horarios
  for update to authenticated using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));
create policy "Usuarios eliminan sus horarios" on public.horarios
  for delete to authenticated using (usuario_id = (select auth.uid()));

create policy "Usuarios ven sus tomas" on public.tomas
  for select to authenticated using (usuario_id = (select auth.uid()));
create policy "Usuarios crean sus tomas" on public.tomas
  for insert to authenticated with check (usuario_id = (select auth.uid()));
create policy "Usuarios editan sus tomas" on public.tomas
  for update to authenticated using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));
create policy "Usuarios eliminan sus tomas" on public.tomas
  for delete to authenticated using (usuario_id = (select auth.uid()));