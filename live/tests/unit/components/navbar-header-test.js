import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Ember from 'ember';

describe('Unit | Component | Navbar Header Component', function() {
  setupTest('component:navbar-header', {});
  const sessionStubResolve = Ember.Service.extend({ isAuthenticated: true });
  const sessionStubReject = Ember.Service.extend({ isAuthenticated: false });

  describe('When user is logged', function() {
    beforeEach(function() {
      this.register('service:session', sessionStubResolve);
      this.inject.service('session', { as: 'session' });
    });

    describe('#isUserLogged', function() {
      it('should return true', function() {
        // when
        const component = this.subject();

        // then
        expect(component.get('isUserLogged')).to.equal(true);
      });
    });

    context('#menu', function() {
      it('should only contains permanent menu items', function() {
        // given
        const expectedLoggedUserMenu = [
          { name: 'Projet', link: 'project', class: 'navbar-header-links__link--project', permanent: true },
          { name: 'Compétences', link: 'competences', class: 'navbar-header-links__link--competences', permanent: true }
        ];

        // when
        const component = this.subject();

        // then
        expect(component.get('menu')).to.deep.equal(expectedLoggedUserMenu);
      });
    });
  });

  context('When user is not logged', function() {
    beforeEach(function() {
      this.register('service:session', sessionStubReject);
      this.inject.service('session', { as: 'session' });
    });

    context('#isUserLogged', function() {
      it('should return false, when user is unauthenticated', function() {
        // when
        const component = this.subject();

        // then
        expect(component.get('isUserLogged')).to.equal(false);
      });
    });

    context('#menu', function() {
      it('should set with default values (including connexion link)', function() {
        // given
        const expectedUnloggedUserMenu = [
          { name: 'Projet', link: 'project', class: 'navbar-header-links__link--project', permanent: true },
          {
            name: 'Compétences',
            link: 'competences',
            class: 'navbar-header-links__link--competences',
            permanent: true
          },
          { name: 'Se connecter', link: 'login', class: 'navbar-menu-signin-link' },
          { name: 'S’inscrire', link: 'inscription', class: 'navbar-menu-signup-link' }
        ];

        // when
        const component = this.subject();

        // then
        expect(component.get('menu')).to.deep.equal(expectedUnloggedUserMenu);
      });
    });
  });
});
