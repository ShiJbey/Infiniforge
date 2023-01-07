# Changelog

## [2.2.0]

- [Added] Rollup as the new bundling tool
- [Added] `CHANGELOG.md`
- [Updated] `.gitignore` to only include relevant entries
- [Updated] Copyright in license to 2023
- [Updated] Project dependencies to latest versions
- [Moved] `three`, `express`, etc. to peer/dev dependencies to prevent clashes from duplicate imports
- [Moved] Infiniforge Server to the main TypeScript Source
- [Removed] Web server graphical demo
- [Removed] Webpack as the bundling tool
- [Removed] `tsconfig.esm` and `tsconfig.cjs` in favor of `rollup.config.js`
- [Removed] Extraneous scripts in `package.json`
- [Removed] AirBnB style plugins from eslint
