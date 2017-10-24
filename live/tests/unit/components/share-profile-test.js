import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Ember from 'ember';

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

  describe('#isOrganizationHasTypeSup', function() {

    it('should return "true" when organization type is "SUP"', function() {
      // given
      component.set('_organization', Ember.Object.create({ type: 'SUP' }));

      // when
      const isOrganizationHasTypeSup = component.get('isOrganizationHasTypeSup');

      // then
      expect(isOrganizationHasTypeSup).to.be.true;
    });

    it('should return "false" when organization type is not "SUP"', function() {
      // given
      component.set('_organization', Ember.Object.create({ type: 'SCO' }));

      // when
      const isOrganizationHasTypeSup = component.get('isOrganizationHasTypeSup');

      // then
      expect(isOrganizationHasTypeSup).to.be.false;
    });

  });

  describe('.organizationLabels', function() {

    it('should return adapted ("orgnisation"-based) labels when organization type is PRO', function() {
      // given
      component.set('_organization', { type: 'PRO' });

      // when
      const organizationLabel = component.get('organizationLabels');

      // then
      expect(organizationLabel.text1).to.equal('Vous vous apprêtez à transmettre une copie de votre profil Pix à l\'organisation :');
      expect(organizationLabel.text2).to.equal('En cliquant sur le bouton « Envoyer », elle recevra les informations suivantes :');
      expect(organizationLabel.text3).to.equal('Elle ne recevra les évolutions futures de votre profil que si vous le partagez à nouveau.');
    });

    it('should return adapted ("établissement"-based) labels when organization type is SUP or SCO', function() {
      // given
      component.set('_organization', { type: 'SUP' });

      // when
      const organizationLabel = component.get('organizationLabels');

      // then
      expect(organizationLabel.text1).to.equal('Vous vous apprêtez à transmettre une copie de votre profil Pix à l\'établissement :');
      expect(organizationLabel.text2).to.equal('En cliquant sur le bouton « Envoyer », il recevra les informations suivantes :');
      expect(organizationLabel.text3).to.equal('Il ne recevra les évolutions futures de votre profil que si vous le partagez à nouveau.');
    });

  });
});
