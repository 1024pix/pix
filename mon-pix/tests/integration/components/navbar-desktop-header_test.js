import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
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

    test('should display the Pix logo', function (assert) {
      // then
      assert.dom('.navbar-desktop-header-logo').exists();
      assert.dom('.pix-logo').exists();
    });

    test('should not display the navigation menu', function (assert) {
      // then
      assert.dom('.navbar-desktop-header-container__menu').doesNotExist();
    });

    test('should display link to signup page', function (assert) {
      // then
      assert.dom('.navbar-menu-signup-link').exists();
    });

    test('should display link to login page', function (assert) {
      // then
      assert.dom('.navbar-menu-signin-link').exists();
    });

    test('should not display the link "J\'ai un code"', function (assert) {
      assert.notOk(contains("J'ai un code"));
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

    test('should display the link "J\'ai un code"', function (assert) {
      assert.ok(contains("J'ai un code"));
    });

    test('should display the Pix logo', function (assert) {
      // then
      assert.dom('.navbar-desktop-header-logo').exists();
      assert.dom('.pix-logo').exists();
    });

    test('should display logged user details informations', function (assert) {
      // then
      assert.dom('.logged-user-details').exists();
    });

    test('should not display link to signup page', function (assert) {
      // then
      assert.dom('.navbar-menu-signup-link').doesNotExist();
    });

    test('should not display link to login page', function (assert) {
      // then
      assert.dom('.navbar-menu-signin-link').doesNotExist();
    });

    test('should display the navigation menu with expected elements', function (assert) {
      // then
      assert.dom('.navbar-desktop-header-container__menu').exists();
      assert.dom('.navbar-desktop-header-menu__item').exists({ count: 5 });
      assert.ok(contains('Accueil'));
      assert.ok(contains('Compétences'));
      assert.ok(contains('Mes tutos'));
      assert.ok(contains('Certification'));
      assert.ok(contains("J'ai un code"));
      assert.notOk(contains('Mes formations'));
    });
  });

  module('when user has recommended trainings', function (hooks) {
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
      class currentUser extends Service {
        user = {
          isAnonymous: false,
          hasRecommendedTrainings: true,
        };
      }
      this.owner.register('service:currentUser', currentUser);
      setBreakpoint('desktop');
      await render(hbs`<NavbarDesktopHeader/>}`);
    });

    test('should display "My trainings" link', async function (assert) {
      assert.dom('.navbar-desktop-header-menu__item').exists({ count: 6 });
      assert.ok(contains('Mes formations'));
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

    test('should display the Pix logo', function (assert) {
      // then
      assert.dom('.navbar-desktop-header-logo').exists();
      assert.dom('.pix-logo').exists();
    });

    test('should not display the navigation menu', function (assert) {
      // then
      assert.dom('.navbar-desktop-header-container__menu').doesNotExist();
    });

    test('should not display link to signup page', function (assert) {
      // then
      assert.dom('.navbar-menu-signup-link').doesNotExist();
    });

    test('should not display link to login page', function (assert) {
      // then
      assert.dom('.navbar-menu-signin-link').doesNotExist();
    });

    test('should not display the join campaign link', function (assert) {
      assert.notOk(contains("J'ai un code"));
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

    test('should display the Pix logo', function (assert) {
      // then
      assert.dom('.navbar-desktop-header-logo').exists();
      assert.dom('.pix-logo').exists();
    });

    test('should not display the navigation menu', function (assert) {
      // then
      assert.dom('.navbar-desktop-header-container__menu').doesNotExist();
    });

    test('should not display link to signup page', function (assert) {
      // then
      assert.dom('.navbar-menu-signup-link').doesNotExist();
    });

    test('should not display link to login page', function (assert) {
      // then
      assert.dom('.navbar-menu-signin-link').doesNotExist();
    });

    test('should not display the join campaign link', function (assert) {
      assert.notOk(contains("J'ai un code"));
    });
  });

  test('should not display marianne logo when url does not have frenchDomainExtension', async function (assert) {
    // given
    this.set('isFrenchDomainUrl', false);

    // when
    await render(hbs`<NavbarDesktopHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    assert.dom('.navbar-desktop-header-logo__marianne').doesNotExist();
  });

  test('should display marianne logo when url does have frenchDomainExtension', async function (assert) {
    // given
    this.set('isFrenchDomainUrl', true);

    // when
    await render(hbs`<NavbarDesktopHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    assert.dom('.navbar-desktop-header-logo__marianne').exists();
  });
});
