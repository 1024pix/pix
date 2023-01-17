import Service from '@ember/service';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import { setBreakpoint } from 'ember-responsive/test-support';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | navbar-header', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user is on desktop', function () {
    test('should render skip links', async function (assert) {
      // given
      setBreakpoint('desktop');

      // when
      const screen = await render(hbs`<NavbarHeader/>`);

      // then
      assert.ok(screen.getByRole('link', { name: this.intl.t('common.skip-links.skip-to-content') }));
      assert.ok(screen.getByRole('link', { name: this.intl.t('common.skip-links.skip-to-footer') }));
    });
  });

  module('When user is not on desktop ', function () {
    test('should be rendered in mobile/tablet mode with a burger', async function (assert) {
      // given
      setBreakpoint('tablet');
      class SessionStub extends Service {
        isAuthenticated = true;
      }
      this.owner.register('service:session', SessionStub);
      class CurrentUserStub extends Service {
        user = { fullName: 'John Doe' };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(hbs`<NavbarHeader />`);

      // then
      assert.ok(screen.getByRole('navigation', { name: this.intl.t('navigation.main.label') }));
      assert.ok(screen.getByRole('button', { name: this.intl.t('navigation.mobile-button-title') }));
    });

    test('should be rendered in mobile/tablet mode without burger', async function (assert) {
      // given
      setBreakpoint('tablet');
      class SessionStub extends Service {
        isAuthenticated = false;
      }
      this.owner.register('service:session', SessionStub);

      // when
      const screen = await render(hbs`<NavbarHeader/>`);

      // then
      assert.dom(screen.queryByRole('navigation', { name: this.intl.t('navigation.main.label') })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: this.intl.t('navigation.mobile-button-title') })).doesNotExist();
    });

    test('should render skip links', async function (assert) {
      // given
      setBreakpoint('tablet');

      // when
      const screen = await render(hbs`<NavbarHeader/>`);

      // then
      assert.ok(screen.getByRole('link', { name: this.intl.t('common.skip-links.skip-to-content') }));
      assert.ok(screen.getByRole('link', { name: this.intl.t('common.skip-links.skip-to-footer') }));
    });
  });
});
