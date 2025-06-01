# Changelog

## v2.1.2

* Include scripts folder in releases.

## v2.1.1

* Fix downstream dependency requirements that could make some projects unable to
  run the postinstall script.

## v2.1.0

* Add `module` field to package metadata.
* Add new documentation.
* Add API summary.
* Relocate bundles to the `dist` folder. CDN links will now point to this folder
  from this version onwards.

Before:

```text
https://unpkg.com/fragmenter@2.0.1/lib/fragmenter.umd.min.js
```

After:

```text
https://unpkg.com/fragmenter@2.1.0/dist/fragmenter.umd.min.js
```

## v2.0.1

* Fix package entry points.

## v2.0.0

* Add support for grapheme clusters composed of multiple code points.

## v1.0.3

* Add UMD module support.

## v1.0.2

* Performance optimizations and code readability improvements.

## v1.0.1

* Update package metadata.

## v1.0.0

* Initial release.
