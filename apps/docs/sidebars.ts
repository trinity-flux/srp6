import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'index',
    'getting-started',
    'api',
    'algorithm',
    {
      type: 'category',
      label: 'Compliance',
      items: ['compliance/rfc', 'compliance/trinitycore'],
    },
    'migration',
  ],
};

export default sidebars;
