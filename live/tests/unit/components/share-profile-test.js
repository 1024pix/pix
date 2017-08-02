import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | share-profile', function() {

  setupTest('component:share-profile', {});

  describe('#init', () => {
    it('should set the overlay as translucent', function() {
      // Given
      const component = this.subject();

      // then
      expect(component.get('isShowingModal')).to.be.equal(false);
    });
  });

  describe('#toggleSharingModal', () => {
    it('should use the "close" action', function() {
      // Given
      const component = this.subject();

      // when
      component.send('toggleSharingModal');

      // then
      expect(component.get('isShowingModal')).to.equal(true);
    });
  });
});
