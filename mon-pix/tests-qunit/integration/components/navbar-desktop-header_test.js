import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';

import { contains } from '../../helpers/contains';

module('Integration | Component | navbar-desktop-header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is not logged', function (hooks) {
    hooks.beforeEach(async function () {
      class sessionService extends Service {
        isAuthenticated = false;
      }
      this.owner.register('service:session', sessionService);
      setBreakpoint('desktop');
      await render(hbs`<NavbarDesktopHeader/>`);
    });

    test('should be rendered', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header__container')).exists();
    });

    test('should display the Pix logo', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header-logo')).exists();
      assert.dom(find('.pix-logo')).exists();
    });

    test('should not display the navigation menu', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header-container__menu')).doesNotExist();
    });

    test('should display link to signup page', function (assert) {
      // then
      assert.dom(find('.navbar-menu-signup-link')).exists();
    });

    test('should display link to login page', function (assert) {
      // then
      assert.dom(find('.navbar-menu-signin-link')).exists();
    });

    test('should not display the link "J\'ai un code"', function (assert) {
      assert.dom(contains("J'ai un code")).doesNotExist();
    });
  });

  module('When user is logged', function (hooks) {
    hooks.beforeEach(async function () {
      class sessionService extends Service {
        isAuthenticated = true;
        data = {
          authenticated: {
            token: 'access_token',
            userId: 1,
            source: 'pix',
          },
        };
      }
      this.owner.register('service:session', sessionService);
      class currentUserService extends Service {
        user = { isAnonymous: false };
      }
      this.owner.register('service:currentUser', currentUserService);
      setBreakpoint('desktop');
      await render(hbs`<NavbarDesktopHeader/>}`);
    });

    test('should be rendered', function (assert) {
      assert.dom(find('.navbar-desktop-header')).exists();
    });

    test('should display the link "J\'ai un code"', function (assert) {
      assert.dom(contains("J'ai un code")).exists();
    });

    test('should display the Pix logo', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header-logo')).exists();
      assert.dom(find('.pix-logo')).exists();
    });

    test('should display logged user details informations', function (assert) {
      // then
      assert.dom(find('.logged-user-details')).exists();
    });

    test('should not display link to signup page', function (assert) {
      // then
      assert.dom(find('.navbar-menu-signup-link')).doesNotExist();
    });

    test('should not display link to login page', function (assert) {
      // then
      assert.dom(find('.navbar-menu-signin-link')).doesNotExist();
    });

    test('should display the navigation menu with expected elements', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header-container__menu')).exists();
      assert.equal(findAll('.navbar-desktop-header-menu__item').length, 5);
      assert.dom(contains('Accueil')).exists();
      assert.dom(contains('Compétences')).exists();
      assert.dom(contains('Mes tutos')).exists();
      assert.dom(contains('Certification')).exists();
      assert.dom(contains("J'ai un code")).exists();
    });
  });

  module('when user comes from external platform', function (hooks) {
    hooks.beforeEach(async function () {
      class sessionService extends Service {
        isAuthenticated = false;
        data = {
          externalUser: 'externalUserToken',
        };
      }
      this.owner.register('service:session', sessionService);

      setBreakpoint('desktop');
      await render(hbs`<NavbarDesktopHeader/>`);
    });

    test('should be rendered', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header__container')).exists();
    });

    test('should display the Pix logo', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header-logo')).exists();
      assert.dom(find('.pix-logo')).exists();
    });

    test('should not display the navigation menu', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header-container__menu')).doesNotExist();
    });

    test('should not display link to signup page', function (assert) {
      // then
      assert.dom(find('.navbar-menu-signup-link')).doesNotExist();
    });

    test('should not display link to login page', function (assert) {
      // then
      assert.dom(find('.navbar-menu-signin-link')).doesNotExist();
    });

    test('should not display the join campaign link', function (assert) {
      assert.dom(contains("J'ai un code")).doesNotExist();
    });
  });

  module('when logged user is anonymous', function (hooks) {
    hooks.beforeEach(async function () {
      class sessionService extends Service {
        isAuthenticated = true;
      }
      this.owner.register('service:session', sessionService);
      class currentUserService extends Service {
        user = { isAnonymous: true };
      }
      this.owner.register('service:currentUser', currentUserService);

      setBreakpoint('desktop');
      await render(hbs`<NavbarDesktopHeader/>`);
    });

    test('should be rendered', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header__container')).exists();
    });

    test('should display the Pix logo', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header-logo')).exists();
      assert.dom(find('.pix-logo')).exists();
    });

    test('should not display the navigation menu', function (assert) {
      // then
      assert.dom(find('.navbar-desktop-header-container__menu')).doesNotExist();
    });

    test('should not display link to signup page', function (assert) {
      // then
      assert.dom(find('.navbar-menu-signup-link')).doesNotExist();
    });

    test('should not display link to login page', function (assert) {
      // then
      assert.dom(find('.navbar-menu-signin-link')).doesNotExist();
    });

    test('should not display the join campaign link', function (assert) {
      assert.dom(contains("J'ai un code")).doesNotExist();
    });
  });

  test('should not display marianne logo when url does not have frenchDomainExtension', async function (assert) {
    // given
    this.set('isFrenchDomainUrl', false);

    // when
    await render(hbs`<NavbarDesktopHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    assert.dom(find('.navbar-desktop-header-logo__marianne')).doesNotExist();
  });

  test('should display marianne logo when url does have frenchDomainExtension', async function (assert) {
    // given
    this.set('isFrenchDomainUrl', true);

    // when
    await render(hbs`<NavbarDesktopHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    assert.dom(find('.navbar-desktop-header-logo__marianne')).exists();
  });
});
