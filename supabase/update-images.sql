-- Asigna las fotos (public/products/*.webp) a los productos ya existentes.
-- Correr en el SQL Editor de Supabase. Es idempotente: se puede ejecutar más de una vez.
-- Si empiezas desde cero, no hace falta: seed.sql ya incluye image_url.

begin;

update public.products set image_url = '/products/espresso.webp' where name = 'Espresso';
update public.products set image_url = '/products/americano.webp' where name = 'Americano';
update public.products set image_url = '/products/capuchino.webp' where name = 'Capuchino';
update public.products set image_url = '/products/latte.webp' where name = 'Latte de vainilla';
update public.products set image_url = '/products/moka.webp' where name = 'Moka caliente';
update public.products set image_url = '/products/chocolate.webp' where name = 'Chocolate caliente';
update public.products set image_url = '/products/te-chai.webp' where name = 'Té chai latte';
update public.products set image_url = '/products/cold-brew.webp' where name = 'Cold brew';
update public.products set image_url = '/products/latte-helado.webp' where name = 'Latte helado';
update public.products set image_url = '/products/frappe-moka.webp' where name = 'Frappé de moka';
update public.products set image_url = '/products/frappe-caramelo.webp' where name = 'Frappé de caramelo';
update public.products set image_url = '/products/frappe-oreo.webp' where name = 'Frappé de galleta';
update public.products set image_url = '/products/limonada.webp' where name = 'Limonada mineral';
update public.products set image_url = '/products/te-helado.webp' where name = 'Té helado de durazno';
update public.products set image_url = '/products/croissant.webp' where name = 'Croissant de mantequilla';
update public.products set image_url = '/products/sandwich.webp' where name = 'Sándwich de jamón y queso';
update public.products set image_url = '/products/hotcakes.webp' where name = 'Hotcakes con miel';
update public.products set image_url = '/products/cheesecake.webp' where name = 'Cheesecake de fresa';
update public.products set image_url = '/products/brownie.webp' where name = 'Brownie con nuez';
update public.products set image_url = '/products/rol-canela.webp' where name = 'Rol de canela';
update public.products set image_url = '/products/galleta.webp' where name = 'Galleta de avena';

commit;

-- Verificación: debe devolver 21 con foto y 0 sin foto.
select count(*) filter (where image_url is not null) as con_foto,
       count(*) filter (where image_url is null) as sin_foto
from public.products;
