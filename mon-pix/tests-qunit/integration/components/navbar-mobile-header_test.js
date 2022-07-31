/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';

module('Integration | Component | navbar-mobile-header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is not logged', function (hooks) {
    hooks.beforeEach(async function () {
      this.owner.register('service:session', Service.extend({ isAuthenticated: false }));
      setBreakpoint('tablet');
      await render(hbs`<NavbarMobileHeader />`);
    });

    test('should be rendered', function (assert) {
      // then
      assert.dom(find('.navbar-mobile-header__container')).exists();
    });

    test('should display the Pix logo', function (assert) {
      // then
      assert.dom(find('.navbar-mobile-header-logo__pix')).exists();
    });

    test('should not display the burger menu', function (assert) {
      // then
      assert.dom(find('.navbar-mobile-header__burger-icon')).doesNotExist();
    });
  });

  module('When user is logged', function () {
    hooks.beforeEach(function () {
      this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
      setBreakpoint('tablet');
    });

    test('should be rendered', async function (assert) {
      // when
      await render(hbs`<NavbarMobileHeader />`);

      // then
      assert.dom(find('.navbar-mobile-header')).exists();
    });

    test('should display the Pix logo', async function (assert) {
      // when
      await render(hbs`<NavbarMobileHeader />`);

      // then
      assert.dom(find('.navbar-mobile-header-logo__pix')).exists();
    });

    test('should display the burger icon', async function (assert) {
      // given
      this.set('burger', {
        state: {
          actions: {
            toggle: () => true,
          },
        },
      });

      // when
      await render(hbs`<NavbarMobileHeader @burger={{this.burger}} />`);

      // then
      assert.dom(find('.navbar-mobile-header__burger-icon')).exists();
    });
  });

  test('should not display marianne logo when url does not have frenchDomainExtension', async function (assert) {
    // given
    this.set('isFrenchDomainUrl', false);

    // when
    await render(hbs`<NavbarMobileHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    assert.dom(find('.navbar-mobile-header-logo__marianne')).doesNotExist();
  });

  test('should display marianne logo when url does have frenchDomainExtension', async function (assert) {
    // given
    this.set('isFrenchDomainUrl', true);

    // when
    await render(hbs`<NavbarMobileHeader @shouldShowTheMarianneLogo={{this.isFrenchDomainUrl}} />`);

    // then
    assert.dom(find('.navbar-mobile-header-logo__marianne')).exists();
  });
});
