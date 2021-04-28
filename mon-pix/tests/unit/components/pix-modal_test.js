import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | pix-modal', function() {

  setupTest();

  describe('#init', () => {
    it('should set the overlay as translucent', function() {
      // given
      const component = this.owner.lookup('component:pix-modal');

      // when
      const translucentOverlay = component.get('translucentOverlay');

      // then
      expect(translucentOverlay).to.be.equal(true);
    });
  });
});
