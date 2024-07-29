import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | window-post-message', function (hooks) {
  setupTest(hooks);

  module('#startCertification', function () {
    test('call the window.postMessage with start event', function (assert) {
      // Given
      const postMessage = sinon.stub();
      const windowPostMessage = this.owner.lookup('service:windowPostMessage');

      // When
      windowPostMessage.startCertification(postMessage);

      // Then
      sinon.assert.calledWith(postMessage, { event: 'pix:certification:start' }, window.location.origin);
      assert.ok(true);
    });
  });

  module('#stopCertification', function () {
    test('call the window.postMessage with stop event', function (assert) {
      // Given
      const postMessage = sinon.stub();
      const windowPostMessage = this.owner.lookup('service:windowPostMessage');

      // When
      windowPostMessage.stopCertification(postMessage);

      // Then
      sinon.assert.calledWith(postMessage, { event: 'pix:certification:stop' }, window.location.origin);
      assert.ok(true);
    });
  });
});
