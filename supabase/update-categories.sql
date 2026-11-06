-- Mueve "Cold brew" y "Latte helado" de la categoría Café a Bebidas frías.
-- Correr en el SQL Editor de Supabase. Es idempotente: se puede ejecutar más de una vez.
-- Si empiezas desde cero, no hace falta: seed.sql ya trae la categoría correcta.
--
-- Los tags (['cafe']) no cambian: siguen contando como café en la franja de la mañana.

begin;

update public.products set category = 'bebida_fria' where name = 'Cold brew';
update public.products set category = 'bebida_fria' where name = 'Latte helado';

commit;

-- Verificación: debe devolver 2 filas, ambas con category = 'bebida_fria'.
select name, category, temperature, tags
from public.products
where name in ('Cold brew', 'Latte helado')
order by name;
