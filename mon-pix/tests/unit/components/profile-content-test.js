import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import ENV from 'mon-pix/config/environment';

describe('Unit | Component | Profile content', function() {
  setupTest();

  let component;
  const intl = Service.create({ t: sinon.stub() });
  const currentDomain = Service.create({ getExtension: sinon.stub() });
  const currentUser = Service.create({ });
  const currentFrenchMessage = ENV.APP.FRENCH_NEW_LEVEL_MESSAGE;
  const currentEnglishMessage = ENV.APP.ENGLISH_NEW_LEVEL_MESSAGE;

  afterEach(function() {
    ENV.APP.FRENCH_NEW_LEVEL_MESSAGE = currentFrenchMessage;
    ENV.APP.ENGLISH_NEW_LEVEL_MESSAGE = currentEnglishMessage;
  });

  describe('#newLevelMessage', function() {

    it('should return null if the message is empty', function() {
      // given
      ENV.APP.FRENCH_NEW_LEVEL_MESSAGE = '';
      intl.t.returns('fr');
      component = createGlimmerComponent('component:profile-content', { });
      component.intl = intl;
      component.currentDomain = currentDomain;
      component.currentUser = currentUser;

      // when
      const result = component.newLevelMessage;

      // then
      expect(result).to.equal(null);
    });

    it('should return the english if the lang is en', function() {
      // given
      ENV.APP.FRENCH_NEW_LEVEL_MESSAGE = 'Message en français';
      ENV.APP.ENGLISH_NEW_LEVEL_MESSAGE = 'English Message';
      intl.t.returns('en');
      component = createGlimmerComponent('component:profile-content', { });
      component.intl = intl;
      component.currentDomain = currentDomain;
      component.currentUser = currentUser;

      // when
      const result = component.newLevelMessage;

      // then
      expect(result).to.equal(ENV.APP.ENGLISH_NEW_LEVEL_MESSAGE);
    });

    it('should return the french message if the lang is not en', function() {
      // given
      ENV.APP.FRENCH_NEW_LEVEL_MESSAGE = 'Message en français';
      ENV.APP.ENGLISH_NEW_LEVEL_MESSAGE = 'English Message';
      intl.t.returns('fr');
      component = createGlimmerComponent('component:profile-content', { });
      component.intl = intl;
      component.currentDomain = currentDomain;
      component.currentUser = currentUser;

      // when
      const result = component.newLevelMessage;

      // then
      expect(result).to.equal(ENV.APP.FRENCH_NEW_LEVEL_MESSAGE);
    });

    it('should return the french message with the correct url', function() {
      // given
      ENV.APP.FRENCH_NEW_LEVEL_MESSAGE = 'Message en français : aller sur pix.fr';
      ENV.APP.ENGLISH_NEW_LEVEL_MESSAGE = 'English Message';
      intl.t.returns('fr');
      currentDomain.getExtension.returns('org');
      component = createGlimmerComponent('component:profile-content', { });
      component.intl = intl;
      component.currentDomain = currentDomain;
      component.currentUser = currentUser;
      const expectedMessage = 'Message en français : aller sur pix.org';

      // when
      const result = component.newLevelMessage;

      // then
      expect(result).to.equal(expectedMessage);
    });

  });

  describe('#newLevelImageUrl', function() {
    it('should return a correct image url', function() {
      // given
      ENV.rootURL = '/';
      intl.t.returns('fr');
      component = createGlimmerComponent('component:profile-content', { });
      component.intl = intl;

      // when
      const result = component.newLevelImageUrl;

      // then
      const expectedUrl = '/images/Illu_niveau6_fr.svg';
      expect(result).to.equal(expectedUrl);
    });
  });

});
