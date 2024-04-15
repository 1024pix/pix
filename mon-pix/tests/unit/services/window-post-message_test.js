import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | window-post-message', function (hooks) {
  setupTest(hooks);

  module('#startCertification', function () {
    test('call the window.postMessage', function (assert) {
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
});
