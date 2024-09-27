import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | pix-companion', function (hooks) {
  setupTest(hooks);

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
      pixCompanion.isExtensionEnabled = false;

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
      pixCompanion.isExtensionEnabled = true;

      // When
      pixCompanion.checkExtensionIsEnabled(windowStub);
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Then
      sinon.assert.calledWith(windowStub.dispatchEvent, new CustomEvent('pix:companion:ping'));
      assert.false(pixCompanion.isExtensionEnabled);
    });
  });
});
