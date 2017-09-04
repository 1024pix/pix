import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';

describe('Acceptance | index page', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  function authenticateUser() {
    server.create('user');

    visit('/connexion');
    fillIn('#pix-email', 'samurai.jack@aku.world');
    fillIn('#pix-password', 'B@ck2past');
    click('.signin-form__submit_button');
  }

  describe('"Hero" section', function() {

    it('should have a link to sign-up page when user is not authenticated', function() {
      // when
      visit('/');

      // then
      return andThen(function() {
        const signUpLink = findWithAssert('.index-page-hero__inscription-link');
        expect(signUpLink.attr('href').trim()).to.equal('/inscription');
      });
    });

    it('should not have a link to sign-up page when user is yet authenticated', function() {
      // given
      authenticateUser();

      // when
      visit('/');

      // then
      return andThen(function() {
        expect(find('.index-page-hero__inscription-link')).to.have.lengthOf(0);
      });
    });
  });

  describe('"Weekly challenges" section', function() {

    beforeEach(function() {
      visit('/deconnexion');
    });

    describe('when user is not authenticated', function() {

      beforeEach(function() {
        visit('/');
      });

      it('should not be rendered when user is not authenticated', function() {
        expect(find('.index-page__section--challenges')).to.have.lengthOf(0);
      });
    });

    describe('when user is authenticated', function() {

      beforeEach(function() {
        authenticateUser();
        visit('/');
      });

      it('should be rendered when user is yet authenticated', function() {
        findWithAssert('.index-page__section--challenges');
      });

      it('should have a title', function() {
        const $title = findWithAssert('.index-page-challenges__presentation-title');
        expect($title.text().trim()).to.equal('Les défis Pix de la semaine');
      });

      it('should have a description', function() {
        const $description = findWithAssert('.index-page-challenges__presentation-text');
        expect($description.text().trim()).to.equal('Chaque semaine, testez vos compétences numériques sur un nouveau sujet.');
      });
    });
  });
});
