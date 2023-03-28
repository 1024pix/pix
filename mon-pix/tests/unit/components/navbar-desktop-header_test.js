import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | Navbar Desktop Header Component', function (hooks) {
  setupTest(hooks);
  const sessionStubResolve = Service.create({ isAuthenticated: true });
  const sessionStubReject = Service.create({ isAuthenticated: false });
  const currentUserStub = Service.create({ user: {} });

  let component;

  module('When user is logged', function (hooks) {
    hooks.beforeEach(function () {
      component = createGlimmerComponent('component:navbar-desktop-header');
      component.session = sessionStubResolve;
      component.currentUser = currentUserStub;
    });

    module('#isUserLogged', function () {
      test('should return true', function (assert) {
        // then
        assert.true(component.isUserLogged);
      });
    });

    module('#menu', function () {
      test('should only contains permanent menu items', function (assert) {
        // given
        const expectedMenu = [];

        // then
        assert.deepEqual(component.menu, expectedMenu);
      });
    });

    module('#showHeaderMenuItem', function () {
      test('should return true, when logged user is not anonymous', function (assert) {
        // given
        currentUserStub.user.isAnonymous = false;

        // then
        assert.true(component.showHeaderMenuItem);
      });

      test('should return false, when logged user is anonymous', function (assert) {
        // given
        currentUserStub.user.isAnonymous = true;

        // then
        assert.false(component.showHeaderMenuItem);
      });
    });
  });

  module('When user is not logged', function (hooks) {
    hooks.beforeEach(function () {
      component = createGlimmerComponent('component:navbar-desktop-header');
      component.session = sessionStubReject;
    });

    module('#isUserLogged', function () {
      test('should return false, when user is unauthenticated', function (assert) {
        // then
        assert.false(component.isUserLogged);
      });
    });

    module('#menu', function () {
      test('should set with default values (including connexion link)', function (assert) {
        // given
        const expectedMenu = [{ link: 'authentication.login' }, { link: 'inscription' }];

        // then
        assert.strictEqual(component.menu.length, expectedMenu.length);
        assert.strictEqual(component.menu[0].link, expectedMenu[0].link);
        assert.strictEqual(component.menu[1].link, expectedMenu[1].link);
      });
    });

    module('#showHeaderMenuItem', function () {
      test('should return false', function (assert) {
        // then
        assert.false(component.showHeaderMenuItem);
      });
    });
  });

  module('When user comes from external platform', function (hooks) {
    hooks.beforeEach(function () {
      component = createGlimmerComponent('component:navbar-desktop-header');
      component.session = Service.create({
        isAuthenticated: false,
        data: {
          externalUser: 'externalUserToken',
        },
      });
    });

    module('#menu', function () {
      test('should return permanent items only', function (assert) {
        // given
        const expectedMenu = [];

        // then
        assert.deepEqual(component.menu, expectedMenu);
      });
    });
  });
});
