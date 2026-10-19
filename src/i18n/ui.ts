// src/i18n/ui.ts
// Translation dictionary for all ~30 UI strings used across components.
// Source: 03-RESEARCH.md Pattern 1 (Translation Dictionary) + UI String Inventory
// Uses `as const` for type-safe key inference and exhaustive locale checking.

export const ui = {
  es: {
    'skip.link': 'Ir al contenido principal',
    'nav.label': 'Navegación principal',
    'nav.inicio': 'Inicio',
    'nav.micologia': 'Micología',
    'nav.generalidades': 'Generalidades de los hongos',
    'nav.grupo': 'Grupo de trabajo',
    'nav.colreptiles': 'Colaboración con reptiles',
    'nav.patologias': 'Patologías',
    'nav.levaduras': 'Levaduras',
    'nav.filamentosos': 'Filamentosos',
    'nav.dimorficos': 'Dimórficos',
    'nav.micosis-peces': 'Micosis peces',
    'nav.investigacion': 'Investigación',
    'nav.articulos-congresos': 'Artículos y congresos',
    'nav.articulos-interesantes': 'Artículos interesantes',
    'nav.laboratorio': 'Laboratorio',
    'nav.recursos': 'Recursos',
    'nav.archivo-imagenes': 'Archivo de imágenes',
    'nav.links-micologia': 'Links micología',
    'nav.links-revistas': 'Links revistas',
    'nav.bibliografia': 'Bibliografía',
    'nav.hamburger.open': 'Abrir menú de navegación',
    'nav.hamburger.close': 'Cerrar menú de navegación',
    'toc.label': 'En esta página',
    'toc.nav-label': 'En esta página',
    'footer.affiliation': 'Grupo de Micología Veterinaria · Facultad de Veterinaria · ULPGC',
    'footer.contact': 'Contacto',
    'lang.current.es': 'Idioma: Español',
    'lang.current.en': 'Idioma: Inglés',
    'lang.switch.es': 'Cambiar a español',
    'lang.switch.en': 'Switch to English',
  },
  en: {
    'skip.link': 'Skip to main content',
    'nav.label': 'Main navigation',
    'nav.inicio': 'Home',
    'nav.micologia': 'Mycology',
    'nav.generalidades': 'Fungal generalities',
    'nav.grupo': 'Research group',
    'nav.colreptiles': 'Reptile collaboration',
    'nav.patologias': 'Pathologies',
    'nav.levaduras': 'Yeasts',
    'nav.filamentosos': 'Filamentous fungi',
    'nav.dimorficos': 'Dimorphic fungi',
    'nav.micosis-peces': 'Fish mycoses',
    'nav.investigacion': 'Research',
    'nav.articulos-congresos': 'Articles & congresses',
    'nav.articulos-interesantes': 'Interesting articles',
    'nav.laboratorio': 'Laboratory',
    'nav.recursos': 'Resources',
    'nav.archivo-imagenes': 'Image archive',
    'nav.links-micologia': 'Mycology links',
    'nav.links-revistas': 'Journal links',
    'nav.bibliografia': 'Bibliography',
    'nav.hamburger.open': 'Open navigation menu',
    'nav.hamburger.close': 'Close navigation menu',
    'toc.label': 'On this page',
    'toc.nav-label': 'On this page',
    'footer.affiliation': 'Veterinary Mycology Group · Faculty of Veterinary Medicine · ULPGC',
    'footer.contact': 'Contact',
    'lang.current.es': 'Language: Spanish',
    'lang.current.en': 'Language: English',
    'lang.switch.es': 'Cambiar a español',
    'lang.switch.en': 'Switch to English',
  },
} as const;

export type UiKey = keyof typeof ui.es;

export function useTranslations(lang: 'es' | 'en') {
  return function t(key: UiKey): string {
    return (ui[lang][key] ?? ui['es'][key]) as string;
  };
}
