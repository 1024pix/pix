import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | navbar desktop menu', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render links', async function (assert) {
    // given
    class SessionStub extends Service {
      isAuthenticated = true;
    }
    this.owner.register('service:session', SessionStub);
    this.set('menu', [
      {
        name: this.intl.t('navigation.not-logged.sign-in'),
      },
      { name: this.intl.t('navigation.not-logged.sign-up') },
    ]);

    // when
    const screen = await render(hbs`<NavbarDesktopMenu @menu={{this.menu}}  />`);

    // then
    assert.dom(screen.getByRole('link', { name: this.intl.t('navigation.not-logged.sign-up') })).exists();
    assert.dom(screen.getByRole('link', { name: this.intl.t('navigation.not-logged.sign-in') })).exists();
  });
});
