import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';

module('Integration | Component | navbar-mobile-header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is not logged', function (hooks) {
    hooks.beforeEach(async function () {
      // given & when
      class SessionStub extends Service {
        isAuthenticated = false;
      }
      this.owner.register('service:session', SessionStub);
      setBreakpoint('tablet');
    });

    test('should be rendered', function (assert) {
      // then
      assert.dom('.navbar-mobile-header__container').exists();
    });

    test('should display the Pix logo', async function (assert) {
      // when
      const screen = await render(hbs`<NavbarMobileHeader />`);

      // then
      assert.ok(screen.getByRole('link', { name: this.intl.t('navigation.homepage') }));
    });

    test('should not display the burger menu', function (assert) {
      // then
      assert.dom('.navbar-mobile-header__burger-icon').doesNotExist();
    });
  });

  module('When user is logged', function (hooks) {
    hooks.beforeEach(function () {
      class SessionStub extends Service {
        isAuthenticated = true;
      }
      this.owner.register('service:session', SessionStub);
      class CurrentUserStub extends Service {
        user = { fullName: 'John Doe' };
      }
      this.owner.register('service:currentUser', CurrentUserStub);
      setBreakpoint('tablet');
    });

    test('should be rendered', async function (assert) {
      // when
      await render(hbs`<NavbarMobileHeader />`);

      // then
      assert.dom('.navbar-mobile-header').exists();
    });

    test('should display the Pix logo', async function (assert) {
      // when
      await render(hbs`<NavbarMobileHeader />`);

      // then
      assert.dom('.navbar-mobile-header-logo__pix').exists();
    });

    test('should display the burger icon', async function (assert) {
      // when
      await render(hbs`<NavbarMobileHeader />`);

      // then
      assert.dom('.navbar-mobile-header__burger-icon').exists();
    });
  });

  test('should not display marianne logo when url does not have frenchDomainExtension', async function (assert) {
    // given
    this.set('isFrenchDomainUrl', false);

    // when
    await render(hbs`<NavbarMobileHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    assert.dom('.navbar-mobile-header-logo__marianne').doesNotExist();
  });

  test('should display marianne logo when url does have frenchDomainExtension', async function (assert) {
    // given
    this.set('isFrenchDomainUrl', true);

    // when
    const screen = await render(hbs`<NavbarMobileHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    assert.ok(screen.getByRole('img', { name: this.intl.t('common.french-republic') }));
  });
});
