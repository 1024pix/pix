import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | pix-companion', function (hooks) {
  setupTest(hooks);

  const ORIGINAL_FT_IS_PIX_COMPANION_MANDATORY = ENV.APP.FT_IS_PIX_COMPANION_MANDATORY;

  hooks.afterEach(() => {
    ENV.APP.FT_IS_PIX_COMPANION_MANDATORY = ORIGINAL_FT_IS_PIX_COMPANION_MANDATORY;
  });

  module('#startCertification', function () {
    test('call the window.postMessage and window.dispatchEvent with certification start event', function (assert) {
      // Given
      const windowStub = {
        dispatchEvent: sinon.stub(),
        postMessage: sinon.stub(),
        location: { origin: 'test' },
      };
      const pixCompanion = this.owner.lookup('service:pix-companion');

      // When
      pixCompanion.startCertification(windowStub);

      // Then
      sinon.assert.calledWith(windowStub.dispatchEvent, new CustomEvent('pix:certification:start'));
      sinon.assert.calledWith(windowStub.postMessage, { event: 'pix:certification:start' }, 'test');
      assert.ok(true);
    });
  });

  module('#stopCertification', function () {
    test('call the window.postMessage and window.dispatchEvent with certification stop event', function (assert) {
      // Given
      const windowStub = {
        dispatchEvent: sinon.stub(),
        postMessage: sinon.stub(),
        location: { origin: 'test' },
      };
      const pixCompanion = this.owner.lookup('service:pix-companion');

      // When
      pixCompanion.stopCertification(windowStub);

      // Then
      sinon.assert.calledWith(windowStub.dispatchEvent, new CustomEvent('pix:certification:stop'));
      sinon.assert.calledWith(windowStub.postMessage, { event: 'pix:certification:stop' }, 'test');
      assert.ok(true);
    });
  });

  module('#checkExtensionIsEnabled', function () {
    test('set isExtensionEnabled to true if pong is received', async function (assert) {
      // Given
      const windowStub = {
        addEventListener: sinon.stub(),
        dispatchEvent: sinon.stub(),
        removeEventListener: sinon.stub(),
        setTimeout: sinon.stub(),
      };
      windowStub.addEventListener.callsFake((type, listener) => {
        assert.strictEqual(type, 'pix:companion:pong');
        listener();
      });
      const pixCompanion = this.owner.lookup('service:pix-companion');
      pixCompanion._isExtensionEnabled = false;

      // When
      pixCompanion.checkExtensionIsEnabled(windowStub);
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Then
      sinon.assert.calledWith(windowStub.dispatchEvent, new CustomEvent('pix:companion:ping'));
      assert.true(pixCompanion.isExtensionEnabled);
    });

    test('set isExtensionEnabled to false if pong is NOT received', async function (assert) {
      // Given
      const windowStub = {
        addEventListener: sinon.stub(),
        dispatchEvent: sinon.stub(),
        removeEventListener: sinon.stub(),
        setTimeout: sinon.stub(),
      };
      windowStub.setTimeout.callsFake((callback, timeout) => {
        assert.strictEqual(timeout, 100);
        callback();
      });
      const pixCompanion = this.owner.lookup('service:pix-companion');
      pixCompanion._isExtensionEnabled = true;

      // When
      pixCompanion.checkExtensionIsEnabled(windowStub);
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Then
      sinon.assert.calledWith(windowStub.dispatchEvent, new CustomEvent('pix:companion:ping'));
      assert.false(pixCompanion.isExtensionEnabled);
    });
  });

  module('#startCheckingExtensionIsEnabled', function () {
    module('when FT_IS_PIX_COMPANION_MANDATORY is false', function () {
      test('do nothing', async function (assert) {
        // Given
        ENV.APP.FT_IS_PIX_COMPANION_MANDATORY = false;
        const windowStub = {
          addEventListener: sinon.stub(),
          dispatchEvent: sinon.stub(),
          removeEventListener: sinon.stub(),
          setInterval: sinon.stub(),
          setTimeout: sinon.stub(),
        };
        const pixCompanion = this.owner.lookup('service:pix-companion');

        // When
        pixCompanion.startCheckingExtensionIsEnabled(windowStub);
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Then
        sinon.assert.notCalled(windowStub.addEventListener);
        sinon.assert.notCalled(windowStub.dispatchEvent);
        sinon.assert.notCalled(windowStub.removeEventListener);
        sinon.assert.notCalled(windowStub.setInterval);
        sinon.assert.notCalled(windowStub.setTimeout);
        assert.ok(true);
      });
    });
  });

  module('#stopCheckingExtensionIsEnabled', function () {
    module('when FT_IS_PIX_COMPANION_MANDATORY is false', function () {
      test('do nothing', async function (assert) {
        // Given
        ENV.APP.FT_IS_PIX_COMPANION_MANDATORY = false;
        const windowStub = {
          clearInterval: sinon.stub(),
        };
        const pixCompanion = this.owner.lookup('service:pix-companion');

        // When
        pixCompanion.stopCheckingExtensionIsEnabled(windowStub);

        // Then
        sinon.assert.notCalled(windowStub.clearInterval);
        assert.ok(true);
      });
    });
  });

  module('#isExtensionEnabled', function () {
    module('when FT_IS_PIX_COMPANION_MANDATORY is false', function () {
      test('always return true', async function (assert) {
        // Given
        ENV.APP.FT_IS_PIX_COMPANION_MANDATORY = false;
        const pixCompanion = this.owner.lookup('service:pix-companion');

        // When
        pixCompanion._isExtensionEnabled = false;

        // Then
        assert.true(pixCompanion.isExtensionEnabled);
      });
    });
  });
});
