// src/lib/defaultNav.ts
// Hardcoded nav used as fallback when Directus is unavailable,
// and as the seed data for the initial nav_items migration.
import type { ProcessedNavItem } from './directus';

export const DEFAULT_NAV: Record<'es' | 'en', ProcessedNavItem[]> = {
  es: [
    { id: 'inicio',       label: 'Inicio',       href: '/' },
    { id: 'micologia',    label: 'Micología',    children: [
      { id: 'generalidades', label: 'Generalidades de los hongos', href: '/micologia/generalidades/' },
      { id: 'grupo',         label: 'Grupo de trabajo',            href: '/micologia/grupo-de-trabajo/' },
      { id: 'colreptiles',   label: 'Colaboración con reptiles',   href: '/micologia/colreptiles/' },
    ]},
    { id: 'patologias',   label: 'Patologías',   children: [
      { id: 'levaduras',    label: 'Levaduras',        href: '/patologias/levaduras/' },
      { id: 'filamentosos', label: 'Filamentosos',     href: '/patologias/filamentosos/' },
      { id: 'dimorficos',   label: 'Dimórficos',       href: '/patologias/dimorficos/' },
      { id: 'micosis-peces',label: 'Micosis peces',    href: '/patologias/micosis-peces/' },
    ]},
    { id: 'investigacion',label: 'Investigación',children: [
      { id: 'articulos-congresos',    label: 'Artículos y congresos',   href: '/investigacion/articulos-congresos/' },
      { id: 'articulos-interesantes', label: 'Artículos interesantes',  href: '/investigacion/articulos-interesantes/' },
    ]},
    { id: 'laboratorio',  label: 'Laboratorio',  href: '/laboratorio/' },
    { id: 'recursos',     label: 'Recursos',     children: [
      { id: 'archivo-imagenes', label: 'Archivo de imágenes', href: '/recursos/archivo-imagenes/' },
      { id: 'links-micologia',  label: 'Links micología',     href: '/recursos/links-micologia/' },
      { id: 'links-revistas',   label: 'Links revistas',      href: '/recursos/links-revistas/' },
      { id: 'bibliografia',     label: 'Bibliografía',        href: '/recursos/bibliografia/' },
    ]},
  ],
  en: [
    { id: 'inicio',       label: 'Home',         href: '/en/' },
    { id: 'micologia',    label: 'Mycology',     children: [
      { id: 'generalidades', label: 'Fungal generalities',    href: '/en/micologia/generalidades/' },
      { id: 'grupo',         label: 'Research group',         href: '/en/micologia/grupo-de-trabajo/' },
      { id: 'colreptiles',   label: 'Reptile collaboration',  href: '/en/micologia/colreptiles/' },
    ]},
    { id: 'patologias',   label: 'Pathologies',  children: [
      { id: 'levaduras',    label: 'Yeasts',              href: '/en/patologias/levaduras/' },
      { id: 'filamentosos', label: 'Filamentous fungi',   href: '/en/patologias/filamentosos/' },
      { id: 'dimorficos',   label: 'Dimorphic fungi',     href: '/en/patologias/dimorficos/' },
      { id: 'micosis-peces',label: 'Fish mycoses',        href: '/en/patologias/micosis-peces/' },
    ]},
    { id: 'investigacion',label: 'Research',     children: [
      { id: 'articulos-congresos',    label: 'Articles & congresses', href: '/en/investigacion/articulos-congresos/' },
      { id: 'articulos-interesantes', label: 'Interesting articles',  href: '/en/investigacion/articulos-interesantes/' },
    ]},
    { id: 'laboratorio',  label: 'Laboratory',   href: '/en/laboratorio/' },
    { id: 'recursos',     label: 'Resources',    children: [
      { id: 'archivo-imagenes', label: 'Image archive',   href: '/en/recursos/archivo-imagenes/' },
      { id: 'links-micologia',  label: 'Mycology links',  href: '/en/recursos/links-micologia/' },
      { id: 'links-revistas',   label: 'Journal links',   href: '/en/recursos/links-revistas/' },
      { id: 'bibliografia',     label: 'Bibliography',    href: '/en/recursos/bibliografia/' },
    ]},
  ],
};
