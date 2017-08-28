import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | share-profile', function() {

  setupTest('component:share-profile', {});

  let component;

  beforeEach(function() {
    component = this.subject();
  });

  describe('#init', () => {

    it('should set the overlay as translucent', function() {
      expect(component.get('_showingModal')).to.be.equal(false);
    });

    it('should set the organizationExists as false', function() {
      expect(component.get('_organizationNotFound')).to.be.equal(false);
    });

  });

  describe('#placeholder', function() {
    it('should leave the placeholder empty with "focusIn"', function() {
      // then
      component.send('focusInOrganizationCodeInput');

      // when
      expect(component.get('_placeholder')).to.be.null;
    });

    it('should reset the placeholder to its default value with "focusOut"', function() {
      // Given
      component.set('placeholder', 'Ex: EFGH89');

      // then
      component.send('focusOutOrganizationCodeInput');

      // when
      expect(component.get('_placeholder')).to.be.equal('Ex: ABCD12');
    });
  });

  describe('#toggleSharingModal', () => {
    it('should use the "open" action', function() {
      // when
      component.send('openModal');

      // then
      expect(component.get('_showingModal')).to.equal(true);
    });

    it('should reset the code to default value', function() {
      // Given
      component.set('_code', 'ABCD01');

      // when
      component.send('closeModal');

      // then
      expect(component.get('_code')).to.be.null;
    });

    it('should reset the organization to default value', function() {
      // Given
      component.set('organization', {});

      // when
      component.send('closeModal');

      // then
      expect(component.get('_organization')).to.equal(null);
    });

  });
});
