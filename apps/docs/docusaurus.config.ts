import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
  title: '@trinity-flux/srp6',
  tagline: 'TrinityCore-compatible SRP6 verifier generation for node.js',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://trinity-flux.github.io',
  baseUrl: '/srp6/',

  organizationName: 'trinity-flux',
  projectName: 'srp6',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    localeConfigs: {
      en: { label: 'English' },
      es: { label: 'Español' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/trinity-flux/srp6/tree/main/apps/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: '@trinity-flux/srp6',
      logo: {
        alt: 'trinity-flux logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/@trinity-flux/srp6',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/trinity-flux/srp6',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting started', to: '/getting-started' },
            { label: 'API reference', to: '/api' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'RFC 2945', href: 'https://tools.ietf.org/html/rfc2945' },
            { label: 'RFC 5054', href: 'https://tools.ietf.org/html/rfc5054' },
            { label: 'TrinityCore', href: 'https://www.trinitycore.org/' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/trinity-flux/srp6' },
            { label: 'npm', href: 'https://www.npmjs.com/package/@trinity-flux/srp6' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Trinity flux Team. Apache-2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'sql'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
