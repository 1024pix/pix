import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'pix-certif/config/environment';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | communication-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  const originalBannerContent = ENV.APP.BANNER.CONTENT;
  const originalBannerType = ENV.APP.BANNER.TYPE;

  hooks.afterEach(function () {
    ENV.APP.BANNER.CONTENT = originalBannerContent;
    ENV.APP.BANNER.TYPE = originalBannerType;
  });

  test('should not display the banner when no banner content', async function (assert) {
    // given
    ENV.APP.BANNER.CONTENT = '';
    ENV.APP.BANNER.TYPE = '';

    // when
    await render(hbs`<CommunicationBanner />`);

    // then
    assert.dom('.pix-banner').doesNotExist();
  });

  test('should display the information banner', async function (assert) {
    // given
    ENV.APP.BANNER.CONTENT = 'information banner text ...';
    ENV.APP.BANNER.TYPE = 'information';

    // when
    const screen = await render(hbs`<CommunicationBanner />`);

    // then
    assert.dom(screen.getByText('information banner text ...')).exists();
    assert.dom(screen.getByRole('button', { name: 'Fermer' })).exists();
  });

  test('should close the information banner on click on close button', async function (assert) {
    // given
    ENV.APP.BANNER.CONTENT = 'information banner text ...';
    ENV.APP.BANNER.TYPE = 'information';
    const screen = await render(hbs`<CommunicationBanner />`);

    // when
    await click(screen.getByRole('button', { name: 'Fermer' }));

    // then
    assert.dom(screen.queryByText('information banner text ...')).doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Fermer' })).doesNotExist();
  });
});
