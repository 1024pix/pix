import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { destroyApp, startApp } from '../helpers/application';

describe('Acceptance | index', function() {
  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Navbar header section', function() {
    it('should have a link to sign-up page when user is not authenticated', function() {
      // when
      /* eslint-disable */
      setBreakpoint('mobile');
      /* eslint-enable */
      visit('/');

      // then
      return andThen(function() {
        const signUpLink = findWithAssert('.navbar-menu-signup-link');
        expect(signUpLink.attr('href').trim()).to.equal('/inscription');
      });
    });

    it('should have a link to log-in page when user is not authenticated', function() {
      // when
      visit('/');

      // then
      return andThen(function() {
        const logInLink = findWithAssert('.navbar-menu-signin-link');
        expect(logInLink.attr('href').trim()).to.equal('/connexion');
      });
    });
  });

});
