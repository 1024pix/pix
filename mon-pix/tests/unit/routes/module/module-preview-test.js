import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | module | module preview', function (hooks) {
  setupTest(hooks);

  let originalEnableModulePreview;

  hooks.beforeEach(function () {
    originalEnableModulePreview = ENV.APP.ENABLE_MODULE_PREVIEW;
  });

  hooks.afterEach(function () {
    ENV.APP.ENABLE_MODULE_PREVIEW = originalEnableModulePreview;
  });

  module('#beforeModel', function () {
    module('when module preview is disabled', function () {
      test('should redirect to home page', function (assert) {
        // given
        ENV.APP.ENABLE_MODULE_PREVIEW = false;
        const router = this.owner.lookup('service:router');
        const replaceWithStub = sinon.stub(router, 'replaceWith');
        const route = this.owner.lookup('route:module-preview');

        // when
        route.beforeModel();

        // then
        sinon.assert.calledOnceWithExactly(replaceWithStub, 'authenticated');
        assert.ok(true);
      });
    });

    module('when module preview is enabled', function () {
      test('should do nothing', function (assert) {
        // given
        ENV.APP.ENABLE_MODULE_PREVIEW = true;
        const router = this.owner.lookup('service:router');
        const replaceWithStub = sinon.stub(router, 'replaceWith');
        const route = this.owner.lookup('route:module-preview');

        // when
        route.beforeModel();

        // then
        sinon.assert.notCalled(replaceWithStub);
        assert.ok(true);
      });
    });
  });
});
