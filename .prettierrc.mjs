// .prettierrc.mjs
// Source: https://github.com/withastro/prettier-plugin-astro
export default {
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
