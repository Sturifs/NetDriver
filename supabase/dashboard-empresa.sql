-- =====================================================================
-- NetDriver · Dashboard de Empresas
-- Pegar COMPLETO en Supabase → SQL Editor → New query → Run.
-- Se puede ejecutar más de una vez sin romper nada.
-- =====================================================================

-- ---------- 1. Datos de empresa en la tabla de perfiles ----------
alter table public.profiles add column if not exists rut_empresa text;
alter table public.profiles add column if not exists rubro text;
alter table public.profiles add column if not exists descripcion_empresa text;
alter table public.profiles add column if not exists sitio_web text;
alter table public.profiles add column if not exists logo_url text;
alter table public.profiles add column if not exists plan text default 'gratis';
alter table public.profiles add column if not exists created_at timestamptz default now();

-- Función auxiliar: ¿el usuario conectado es una empresa?
-- (security definer evita bucles de permisos sobre la tabla profiles)
create or replace function public.es_empresa()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and tipo = 'empresa');
$$;

-- ---------- 2. Empleos publicados ----------
create table if not exists public.empleos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null,
  titulo text not null,
  tipo_trabajo text,
  licencias text[] default '{}',
  region text,
  comuna text,
  turno text,
  sueldo_min integer,
  sueldo_max integer,
  mostrar_sueldo boolean default true,
  descripcion text,
  requisitos text,
  beneficios text,
  vacantes integer default 1,
  fecha_inicio date,
  fecha_vencimiento date,
  duracion_dias integer,
  es_relampago boolean default false,
  estado text not null default 'activo' check (estado in ('activo','pausado','cerrado')),
  created_at timestamptz default now(),
  constraint empleos_empresa_id_fkey foreign key (empresa_id) references public.profiles(id) on delete cascade
);
create index if not exists empleos_empresa_idx on public.empleos(empresa_id);
create index if not exists empleos_estado_idx on public.empleos(estado);

-- ---------- 3. Postulaciones (conductor → empleo) ----------
create table if not exists public.postulaciones (
  id uuid primary key default gen_random_uuid(),
  empleo_id uuid not null,
  conductor_id uuid not null,
  empresa_id uuid not null,
  estado text not null default 'nueva'
    check (estado in ('nueva','revisada','preseleccionada','entrevista','contratado','descartada')),
  mensaje text,
  notas_empresa text,
  fecha_contratacion timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint postulaciones_empleo_id_fkey foreign key (empleo_id) references public.empleos(id) on delete cascade,
  constraint postulaciones_conductor_id_fkey foreign key (conductor_id) references public.profiles(id) on delete cascade,
  constraint postulaciones_empresa_id_fkey foreign key (empresa_id) references public.profiles(id) on delete cascade,
  constraint postulaciones_unica unique (empleo_id, conductor_id)
);
create index if not exists postulaciones_empresa_idx on public.postulaciones(empresa_id);
create index if not exists postulaciones_conductor_idx on public.postulaciones(conductor_id);

-- ---------- 4. Conductores guardados por la empresa ----------
create table if not exists public.conductores_guardados (
  empresa_id uuid not null,
  conductor_id uuid not null,
  nota text,
  created_at timestamptz default now(),
  primary key (empresa_id, conductor_id),
  constraint guardados_empresa_id_fkey foreign key (empresa_id) references public.profiles(id) on delete cascade,
  constraint guardados_conductor_id_fkey foreign key (conductor_id) references public.profiles(id) on delete cascade
);

-- ---------- 5. Entrevistas ----------
create table if not exists public.entrevistas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null,
  conductor_id uuid not null,
  postulacion_id uuid,
  empleo_id uuid,
  fecha_hora timestamptz not null,
  modalidad text default 'presencial' check (modalidad in ('presencial','videollamada','telefono')),
  lugar text,
  notas text,
  estado text not null default 'programada' check (estado in ('programada','realizada','cancelada')),
  created_at timestamptz default now(),
  constraint entrevistas_empresa_id_fkey foreign key (empresa_id) references public.profiles(id) on delete cascade,
  constraint entrevistas_conductor_id_fkey foreign key (conductor_id) references public.profiles(id) on delete cascade,
  constraint entrevistas_postulacion_id_fkey foreign key (postulacion_id) references public.postulaciones(id) on delete set null,
  constraint entrevistas_empleo_id_fkey foreign key (empleo_id) references public.empleos(id) on delete set null
);
create index if not exists entrevistas_empresa_idx on public.entrevistas(empresa_id);

-- ---------- 6. Opiniones de conductores sobre empresas ----------
create table if not exists public.opiniones_empresa (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null,
  conductor_id uuid not null,
  puntaje integer not null check (puntaje between 1 and 5),
  comentario text,
  created_at timestamptz default now(),
  constraint opiniones_empresa_id_fkey foreign key (empresa_id) references public.profiles(id) on delete cascade,
  constraint opiniones_conductor_id_fkey foreign key (conductor_id) references public.profiles(id) on delete cascade,
  constraint opiniones_unica unique (empresa_id, conductor_id)
);

-- =====================================================================
-- PERMISOS (Row Level Security): cada uno ve y modifica solo lo suyo
-- =====================================================================
alter table public.empleos enable row level security;
alter table public.postulaciones enable row level security;
alter table public.conductores_guardados enable row level security;
alter table public.entrevistas enable row level security;
alter table public.opiniones_empresa enable row level security;

-- Perfiles: las empresas pueden ver perfiles de conductores y todos pueden ver
-- perfiles de empresas (nombre, logo) para mostrar quién publica cada empleo.
drop policy if exists "empresas ven conductores" on public.profiles;
create policy "empresas ven conductores" on public.profiles
  for select using (tipo = 'conductor' and public.es_empresa());
drop policy if exists "perfiles de empresa visibles" on public.profiles;
create policy "perfiles de empresa visibles" on public.profiles
  for select using (tipo = 'empresa' and auth.uid() is not null);

-- Empleos
drop policy if exists "empleos visibles" on public.empleos;
create policy "empleos visibles" on public.empleos
  for select using (estado = 'activo' or empresa_id = auth.uid());
drop policy if exists "empresa crea empleos" on public.empleos;
create policy "empresa crea empleos" on public.empleos
  for insert with check (empresa_id = auth.uid() and public.es_empresa());
drop policy if exists "empresa edita sus empleos" on public.empleos;
create policy "empresa edita sus empleos" on public.empleos
  for update using (empresa_id = auth.uid()) with check (empresa_id = auth.uid());
drop policy if exists "empresa borra sus empleos" on public.empleos;
create policy "empresa borra sus empleos" on public.empleos
  for delete using (empresa_id = auth.uid());

-- Postulaciones
drop policy if exists "ver postulaciones propias" on public.postulaciones;
create policy "ver postulaciones propias" on public.postulaciones
  for select using (conductor_id = auth.uid() or empresa_id = auth.uid());
drop policy if exists "conductor postula" on public.postulaciones;
create policy "conductor postula" on public.postulaciones
  for insert with check (
    conductor_id = auth.uid()
    and empresa_id = (select e.empresa_id from public.empleos e where e.id = empleo_id and e.estado = 'activo')
  );
drop policy if exists "empresa gestiona postulaciones" on public.postulaciones;
create policy "empresa gestiona postulaciones" on public.postulaciones
  for update using (empresa_id = auth.uid()) with check (empresa_id = auth.uid());
drop policy if exists "conductor retira postulacion" on public.postulaciones;
create policy "conductor retira postulacion" on public.postulaciones
  for delete using (conductor_id = auth.uid());

-- Guardados
drop policy if exists "empresa gestiona guardados" on public.conductores_guardados;
create policy "empresa gestiona guardados" on public.conductores_guardados
  for all using (empresa_id = auth.uid()) with check (empresa_id = auth.uid() and public.es_empresa());

-- Entrevistas
drop policy if exists "ver entrevistas propias" on public.entrevistas;
create policy "ver entrevistas propias" on public.entrevistas
  for select using (empresa_id = auth.uid() or conductor_id = auth.uid());
drop policy if exists "empresa crea entrevistas" on public.entrevistas;
create policy "empresa crea entrevistas" on public.entrevistas
  for insert with check (empresa_id = auth.uid() and public.es_empresa());
drop policy if exists "empresa edita entrevistas" on public.entrevistas;
create policy "empresa edita entrevistas" on public.entrevistas
  for update using (empresa_id = auth.uid()) with check (empresa_id = auth.uid());
drop policy if exists "empresa borra entrevistas" on public.entrevistas;
create policy "empresa borra entrevistas" on public.entrevistas
  for delete using (empresa_id = auth.uid());

-- Opiniones: públicas para usuarios conectados; solo opina un conductor contratado por esa empresa
drop policy if exists "opiniones visibles" on public.opiniones_empresa;
create policy "opiniones visibles" on public.opiniones_empresa
  for select using (auth.uid() is not null);
drop policy if exists "conductor contratado opina" on public.opiniones_empresa;
create policy "conductor contratado opina" on public.opiniones_empresa
  for insert with check (
    conductor_id = auth.uid()
    and exists (select 1 from public.postulaciones p
                where p.conductor_id = auth.uid() and p.empresa_id = opiniones_empresa.empresa_id
                  and p.estado = 'contratado')
  );
drop policy if exists "conductor edita su opinion" on public.opiniones_empresa;
create policy "conductor edita su opinion" on public.opiniones_empresa
  for update using (conductor_id = auth.uid()) with check (conductor_id = auth.uid());
drop policy if exists "conductor borra su opinion" on public.opiniones_empresa;
create policy "conductor borra su opinion" on public.opiniones_empresa
  for delete using (conductor_id = auth.uid());

-- Listo. Debería aparecer "Success. No rows returned".
