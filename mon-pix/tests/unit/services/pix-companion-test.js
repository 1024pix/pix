import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | pix-companion', function (hooks) {
  setupTest(hooks);

  module('#startCertification', function () {
    test('call the window.postMessage and window.dispatchEvent with certification start event', function (assert) {
      // Given
      const dispatchEvent = sinon.stub();
      const postMessage = sinon.stub();
      const location = { origin: 'test' };
      const windowStub = { dispatchEvent, postMessage, location };
      const pixCompanion = this.owner.lookup('service:pix-companion');

      // When
      pixCompanion.startCertification(windowStub);

      // Then
      sinon.assert.calledWith(dispatchEvent, new CustomEvent('pix:certification:start'));
      sinon.assert.calledWith(postMessage, { event: 'pix:certification:start' }, 'test');
      assert.ok(true);
    });
  });

  module('#stopCertification', function () {
    test('call the window.postMessage and window.dispatchEvent with certification stop event', function (assert) {
      // Given
      const dispatchEvent = sinon.stub();
      const postMessage = sinon.stub();
      const location = { origin: 'test' };
      const windowStub = { dispatchEvent, postMessage, location };
      const pixCompanion = this.owner.lookup('service:pix-companion');

      // When
      pixCompanion.stopCertification(windowStub);

      // Then
      sinon.assert.calledWith(dispatchEvent, new CustomEvent('pix:certification:stop'));
      sinon.assert.calledWith(postMessage, { event: 'pix:certification:stop' }, 'test');
      assert.ok(true);
    });
  });
});
