import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

import { keyUp } from 'ember-keyboard';

describe('Unit | Component | pix-modal', function() {

  setupTest('component:pix-modale', {
    needs: ['service:keyboard', 'service:modal-dialog']
  });

  describe('#init', () => {
    it('should set the overlay as translucent', function() {
      // Given
      const component = this.subject();

      // then
      expect(component.get('translucentOverlay')).to.be.equal(true);
    });

    it('should activate keyboard events', function() {
      // Given
      const component = this.subject();

      // then
      expect(component.get('keyboardActivated')).to.be.equal(true);
    });
  });

  describe('#closeOnEsc', () => {
    it('should use the "close" action', function() {
      // Given
      const sendActionStub = sinon.stub();

      const component = this.subject();
      component.sendAction = sendActionStub;
      component.trigger(keyUp('Escape'));

      // then
      sinon.assert.calledWith(sendActionStub, 'close');
    });
  });
});
