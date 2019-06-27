import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Navbar Header Component', function() {
  setupTest();
  const sessionStubResolve = Service.create({ isAuthenticated: true });
  const sessionStubReject = Service.create({ isAuthenticated: false });

  describe('When user is logged', function() {
    describe('#isUserLogged', function() {
      it('should return true', function() {
        // when
        const component = this.owner.lookup('component:navbar-header');
        component.set('session', sessionStubResolve);

        // then
        expect(component.get('isUserLogged')).to.equal(true);
      });
    });

    context('#menu', function() {
      it('should only contains permanent menu items', function() {
        // given
        const expectedLoggedUserMenu = [];

        // when
        const component = this.owner.lookup('component:navbar-header');
        component.set('session', sessionStubResolve);

        // then
        expect(component.get('menu')).to.deep.equal(expectedLoggedUserMenu);
      });
    });
  });

  context('When user is not logged', function() {

    context('#isUserLogged', function() {
      it('should return false, when user is unauthenticated', function() {
        // when
        const component = this.owner.lookup('component:navbar-header');
        component.set('session', sessionStubReject);

        // then
        expect(component.get('isUserLogged')).to.equal(false);
      });
    });

    context('#menu', function() {
      it('should set with default values (including connexion link)', function() {
        // given
        const expectedUnloggedUserMenu = [
          { name: 'Se connecter', link: 'login', class: 'navbar-menu-signin-link' },
          { name: 'S’inscrire', link: 'inscription', class: 'navbar-menu-signup-link' }
        ];

        // when
        const component = this.owner.lookup('component:navbar-header');
        component.set('session', sessionStubReject);

        // then
        expect(component.get('menu')).to.deep.equal(expectedUnloggedUserMenu);
      });
    });
  });
});
