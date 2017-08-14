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

    it('should set the organizationExists as true', function() {
      // Given
      const component = this.subject();

      // then
      expect(component.get('organizationExists')).to.be.equal(true);
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

    it('should reset the code to default value', function() {
      // Given
      const component = this.subject();
      component.set('code', 'ABCD01');

      // when
      component.send('toggleSharingModal');

      // then
      expect(component.get('code')).to.equal('');
    });

    it('should the organizationExists to true', function() {
      // Given
      const component = this.subject();
      component.set('organizationExists', false);

      // when
      component.send('toggleSharingModal');

      // then
      expect(component.get('organizationExists')).to.equal(true);
    });

    it('should reset the organization to default value', function() {
      // Given
      const component = this.subject();
      component.set('organization', {});

      // when
      component.send('toggleSharingModal');

      // then
      expect(component.get('organization')).to.equal(null);
    });

  });
});
