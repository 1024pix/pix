/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';
import { contains } from '../../helpers/contains';

module('Integration | Component | navbar-header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is on desktop', function (hooks) {
    hooks.beforeEach(async function () {
      setBreakpoint('desktop');
      await render(hbs`<NavbarHeader/>`);
    });

    test('should be rendered in desktop mode', function (assert) {
      // then
      assert.dom('.navbar-desktop-header__container').exists();
    });

    test('should render skip links', async function (assert) {
      assert.ok(contains(this.intl.t('common.skip-links.skip-to-content')));
      assert.ok(contains(this.intl.t('common.skip-links.skip-to-footer')));
    });
  });

  module('When user is not on desktop ', function (hooks) {
    hooks.beforeEach(function () {
      setBreakpoint('tablet');
    });

    test('should be rendered in mobile/tablet mode with a burger', async function (assert) {
      // when
      this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
      this.owner.register('service:currentUser', Service.extend({ user: { fullName: 'John Doe' } }));
      this.set('burger', {
        state: {
          actions: {
            toggle: () => true,
          },
        },
      });
      await render(hbs`<NavbarHeader @burger={{this.burger}} />`);
      // then
      assert.dom('.navbar-mobile-header__container').exists();
      assert.dom('.navbar-mobile-header__burger-icon').exists();
    });

    test('should be rendered in mobile/tablet mode without burger', async function (assert) {
      // when
      await render(hbs`<NavbarHeader/>`);

      // then
      assert.dom('.navbar-mobile-header__container').exists();
      assert.dom('.navbar-mobile-header__burger-icon').doesNotExist();
    });

    test('should render skip links', async function (assert) {
      this.owner.register('service:currentUser', Service.extend({ user: { fullName: 'John Doe' } }));

      await render(hbs`<NavbarHeader/>`);

      assert.ok(contains(this.intl.t('common.skip-links.skip-to-content')));
      assert.ok(contains(this.intl.t('common.skip-links.skip-to-footer')));
    });
  });
});
