
> pix-api@3.332.0 esm-migration:prepare:detect
> jscodeshift --transform ./codemods/migrate-cjs-to-esm/transforms/src/detect-incompatible-cjs-named-exports.js --extensions js --ignore-config=.codemodsignore . | grep papapa -A 1 | grep path

  path: 'db/knexfile.js',
  path: 'lib/infrastructure/mailers/mailer.js',
  path: 'lib/infrastructure/utils/redis-monitor.js',
  path: 'db/database-builder/database-buffer.js',
  path: 'tests/test-helper.js',
  path: 'lib/infrastructure/caches/learning-content-cache.js',
  path: 'tests/tooling/domain-builder/domain-builder.js',
  path: 'tests/tooling/learning-content-builder/index.js',
  path: 'tests/tooling/chai-custom-helpers/deep-equal-array.js',
  path: 'tests/tooling/chai-custom-helpers/deep-equal-instance-omitting.js',
  path: 'tests/tooling/chai-custom-helpers/deep-equal-instance.js',
  path: 'tests/tooling/chai-custom-helpers/index.js',
  path: 'tests/tooling/domain-builder/factory/build-validation.js',
  path: 'tests/tooling/domain-builder/factory/build-skill-learning-content-data-object.js',
