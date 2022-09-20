import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | pix-modal-deprecated', function () {
  setupTest();

  describe('#init', () => {
    it('should set the overlay as translucent', function () {
      // given
      const component = this.owner.lookup('component:pix-modal-deprecated');

      // when
      const translucentOverlay = component.get('translucentOverlay');

      // then
      expect(translucentOverlay).to.be.equal(true);
    });
  });
});
