import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Navbar Header Component', function() {
  setupTest();
  const routeStubInCampaignResults = Service.create({ currentRouteName: 'campaigns.skill-review' });
  const routeStubNotInCampaignResults = Service.create({ currentRouteName: 'profil' });
  const sessionStubResolve = Service.create({ isAuthenticated: true });
  const sessionStubReject = Service.create({ isAuthenticated: false });

  let component;

  describe('When user has any login status', function() {
    beforeEach(function() {
      component = this.owner.lookup('component:navbar-header');
    });

    context('and is not in the campaign results page', function() {
      beforeEach(function() {
        component.set('router', routeStubNotInCampaignResults);
      });

      context('#isInCampaignResults', function() {
        it('should return false', function() {
          // then
          expect(component.get('isInCampaignResults')).to.equal(false);
        });
      });
    });

    context('and is in the campaign results page', function() {
      beforeEach(function() {
        component.set('router', routeStubInCampaignResults);
      });

      context('#isInCampaignResults', function() {
        it('should return true', function() {
          // then
          expect(component.get('isInCampaignResults')).to.equal(true);
        });
      });
    });
  });

  describe('When user is logged', function() {
    beforeEach(function() {
      component = this.owner.lookup('component:navbar-header');
      component.set('session', sessionStubResolve);
    });

    context('#isUserLogged', function() {
      it('should return true', function() {
        // then
        expect(component.get('isUserLogged')).to.equal(true);
      });
    });

    context('#menu', function() {
      it('should only contains permanent menu items', function() {
        // given
        const expectedLoggedUserMenu = [];

        // then
        expect(component.get('menu')).to.deep.equal(expectedLoggedUserMenu);
      });
    });
  });

  describe('When user is not logged', function() {
    beforeEach(function() {
      component = this.owner.lookup('component:navbar-header');
      component.set('session', sessionStubReject);
    });

    context('#isUserLogged', function() {
      it('should return false, when user is unauthenticated', function() {
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

        // then
        expect(component.get('menu')).to.deep.equal(expectedUnloggedUserMenu);
      });
    });
  });
});
