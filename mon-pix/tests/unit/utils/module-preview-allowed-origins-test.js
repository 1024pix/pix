import ENV from 'mon-pix/config/environment';
import { isModulePreviewAllowedOrigin } from 'mon-pix/utils/module-preview-allowed-origins';
import { module, test } from 'qunit';

module('Unit | Utility | module-preview-allowed-origins', function (hooks) {
  let originalIsDevEnvironment;
  let originalModulePreviewAllowedOrigins;

  hooks.beforeEach(function () {
    originalIsDevEnvironment = ENV.APP.IS_DEV_ENVIRONMENT;
    originalModulePreviewAllowedOrigins = ENV.APP.MODULE_PREVIEW_ALLOWED_ORIGINS;
  });

  hooks.afterEach(function () {
    ENV.APP.IS_DEV_ENVIRONMENT = originalIsDevEnvironment;
    ENV.APP.MODULE_PREVIEW_ALLOWED_ORIGINS = originalModulePreviewAllowedOrigins;
  });

  module('#isModulePreviewAllowedOrigin', function () {
    module('when NODE_ENV is dev', function (hooks) {
      hooks.beforeEach(function () {
        ENV.APP.IS_DEV_ENVIRONMENT = true;
        ENV.APP.MODULE_PREVIEW_ALLOWED_ORIGINS = ['https://1024pix.github.io'];
      });

      test('should return true for an origin which is not in the whitelist', function (assert) {
        // when
        const result = isModulePreviewAllowedOrigin('http://localhost:5279');

        // then
        assert.true(result);
      });
    });

    module('when NODE_ENV is not dev', function (hooks) {
      hooks.beforeEach(function () {
        ENV.APP.IS_DEV_ENVIRONMENT = false;
        ENV.APP.MODULE_PREVIEW_ALLOWED_ORIGINS = ['https://1024pix.github.io'];
      });

      test('should return true for an origin in the whitelist', function (assert) {
        // when
        const result = isModulePreviewAllowedOrigin('https://1024pix.github.io');

        // then
        assert.true(result);
      });

      test('should return true for any origin of a whitelist with several origins', function (assert) {
        // given
        ENV.APP.MODULE_PREVIEW_ALLOWED_ORIGINS = ['https://a.pix.fr', 'https://1024pix.github.io'];

        // when
        const result = isModulePreviewAllowedOrigin('https://1024pix.github.io');

        // then
        assert.true(result);
      });

      test('should return false when whitelist is empty', function (assert) {
        // given
        ENV.APP.MODULE_PREVIEW_ALLOWED_ORIGINS = [];

        // when
        const result = isModulePreviewAllowedOrigin('https://1024pix.github.io');

        // then
        assert.false(result);
      });
    });
  });
});
