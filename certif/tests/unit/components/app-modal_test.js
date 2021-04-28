import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import { keyUp } from 'ember-keyboard';

module('Unit | Component | app-modal', function(hooks) {

  setupTest(hooks);

  let modal;

  hooks.beforeEach(function() {
    modal = this.owner.lookup('component:app-modal');
  });

  module('#init', function() {
    test('should set the overlay as translucent', function(assert) {
      // then
      assert.equal(modal.get('translucentOverlay'), true);
    });

    test('should activate keyboard events', function(assert) {
      // then
      assert.equal(modal.get('keyboardActivated'), true);
    });
  });

  module('#closeOnEsc', function() {
    test('should use the "close" action', function(assert) {
      // Given
      const sendActionStub = sinon.stub();

      modal.onClose = sendActionStub;
      modal.trigger(keyUp('Escape'));

      // then
      assert.equal(sendActionStub.calledOnce, true);
    });
  });
});

