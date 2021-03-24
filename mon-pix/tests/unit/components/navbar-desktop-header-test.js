import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | Navbar Desktop Header Component', function() {
  setupTest();
  const sessionStubResolve = Service.create({ isAuthenticated: true });
  const sessionStubReject = Service.create({ isAuthenticated: false });
  const currentUserStub = Service.create({ user: {} });

  let component;

  describe('When user is logged', function() {
    beforeEach(function() {
      component = createGlimmerComponent('component:navbar-desktop-header');
      component.session = sessionStubResolve;
      component.currentUser = currentUserStub;
    });

    context('#isUserLogged', function() {
      it('should return true', function() {
        // then
        expect(component.isUserLogged).to.equal(true);
      });
    });

    context('#menu', function() {
      it('should only contains permanent menu items', function() {
        // given
        const expectedMenu = [];

        // then
        expect(component.menu).to.deep.equal(expectedMenu);
      });
    });

    context('#showHeaderMenuItem', function() {
      it('should return true, when logged user is not anonymous', () => {
        // given
        currentUserStub.user.isAnonymous = false;

        // then
        expect(component.showHeaderMenuItem).to.be.true;
      });

      it('should return false, when logged user is anonymous', () => {
        // given
        currentUserStub.user.isAnonymous = true;

        // then
        expect(component.showHeaderMenuItem).to.be.false;
      });
    });
  });

  describe('When user is not logged', function() {
    beforeEach(function() {
      component = createGlimmerComponent('component:navbar-desktop-header');
      component.session = sessionStubReject;
    });

    context('#isUserLogged', function() {
      it('should return false, when user is unauthenticated', function() {
        // then
        expect(component.isUserLogged).to.equal(false);
      });
    });

    context('#menu', function() {
      it('should set with default values (including connexion link)', function() {
        // given
        const expectedMenu = [
          { link: 'login' },
          { link: 'inscription' },
        ];

        // then
        expect(component.menu).to.have.lengthOf(expectedMenu.length);
        expect(component.menu[0].link).to.equal(expectedMenu[0].link);
        expect(component.menu[1].link).to.equal(expectedMenu[1].link);
      });
    });

    context('#showHeaderMenuItem', function() {
      it('should return false', () => {
        // then
        expect(component.showHeaderMenuItem).to.be.false;
      });
    });
  });

  describe('When user comes from external platform', function() {
    beforeEach(function() {
      component = createGlimmerComponent('component:navbar-desktop-header');
      component.session = Service.create({
        isAuthenticated: false,
        data: {
          externalUser: 'externalUserToken',
        },
      });
    });

    context('#menu', function() {
      it('should return permanent items only', function() {
        // given
        const expectedMenu = [];

        // then
        expect(component.menu).to.deep.equal(expectedMenu);
      });
    });
  });
});
