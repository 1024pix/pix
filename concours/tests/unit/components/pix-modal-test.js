import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

import { keyUp } from 'ember-keyboard';

describe('Unit | Component | pix-modal', function() {

  setupTest();

  describe('#init', () => {
    it('should set the overlay as translucent', function() {
      // Given
      const component = this.owner.lookup('component:pix-modal');

      // then
      expect(component.get('translucentOverlay')).to.be.equal(true);
    });

    it('should activate keyboard events', function() {
      // Given
      const component = this.owner.lookup('component:pix-modal');

      // then
      expect(component.get('keyboardActivated')).to.be.equal(true);
    });
  });

  describe('#closeOnEsc', () => {

    it('should use the "close" action', function() {
      // Given
      const sendActionStub = sinon.stub();

      const component = this.owner.lookup('component:pix-modal');
      component.onClose = sendActionStub;
      component.trigger(keyUp('Escape'));

      // then
      sinon.assert.calledOnce(sendActionStub);
    });
  });
});
