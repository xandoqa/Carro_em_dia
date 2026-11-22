/**
 * ESLint do projeto.
 *
 * 'prettier' aqui é o eslint-config-prettier: ele só DESLIGA as regras de
 * formatação que brigariam com o Prettier. A formatação em si é do Prettier,
 * rodado à parte com `npm run format` — não pelo ESLint, que ficaria lento e
 * transformaria espaço em branco em erro de lint.
 */
module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  ignorePatterns: [
    '/dist/*',
    '/dist-*/*',
    '/web-build/*',
    '/node_modules/*',
    '/design/preview/*',
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
