/* eslint ember/no-classic-classes: 0 */

import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';
import { contains } from '../../helpers/contains';

module('Integration | Component | navbar-header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is on desktop', function () {
    test('should render skip links', async function (assert) {
      // given
      setBreakpoint('desktop');

      // when
      await render(hbs`<NavbarHeader/>`);

      // then
      assert.ok(contains(this.intl.t('common.skip-links.skip-to-content')));
      assert.ok(contains(this.intl.t('common.skip-links.skip-to-footer')));
    });
  });

  module('When user is not on desktop ', function () {
    test('should be rendered in mobile/tablet mode with a burger', async function (assert) {
      // given
      setBreakpoint('tablet');
      this.owner.register('service:session', Service.extend({ isAuthenticated: true }));
      this.owner.register('service:currentUser', Service.extend({ user: { fullName: 'John Doe' } }));
      this.set('burger', {
        state: {
          actions: {
            toggle: () => true,
          },
        },
      });

      // when
      await render(hbs`<NavbarHeader @burger={{this.burger}} />`);

      // then
      assert.dom('.navbar-mobile-header__container').exists();
      assert.dom('.navbar-mobile-header__burger-icon').exists();
    });

    test('should be rendered in mobile/tablet mode without burger', async function (assert) {
      // given
      setBreakpoint('tablet');

      // when
      await render(hbs`<NavbarHeader/>`);

      // then
      assert.dom('.navbar-mobile-header__container').exists();
      assert.dom('.navbar-mobile-header__burger-icon').doesNotExist();
    });

    test('should render skip links', async function (assert) {
      // given
      setBreakpoint('tablet');
      this.owner.register('service:currentUser', Service.extend({ user: { fullName: 'John Doe' } }));

      // when
      await render(hbs`<NavbarHeader/>`);

      // then
      assert.ok(contains(this.intl.t('common.skip-links.skip-to-content')));
      assert.ok(contains(this.intl.t('common.skip-links.skip-to-footer')));
    });
  });
});
