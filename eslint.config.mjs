// @ts-check
import nextConfig from 'eslint-config-next';

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**'],
  },
];

export default eslintConfig;
