module.exports = {
  trailingComma: 'es5',
  tabWidth: 2,
  semi: false,
  singleQuote: true,

  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],

  // @trivago/prettier-plugin-sort-imports
  importOrder: ['^[./]?src/.*)', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
}
