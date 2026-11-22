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
  overrides: [
    {
      // Em TypeScript, quem confere se um nome existe dentro de um import é o
      // próprio compilador (`npm run typecheck`), e ele segue reexportações
      // que o eslint-plugin-import não segue — com o expo-notifications, a
      // regra acusava AndroidImportance como inexistente, sendo que ele existe
      // e compila. A documentação do typescript-eslint recomenda desligar.
      files: ['*.ts', '*.tsx'],
      rules: {
        'import/namespace': 'off',
        'import/named': 'off',
        'import/default': 'off',
      },
    },
  ],
};
