import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'mon-pix/config/environment';

module('Integration | Component | communication-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  const originalBannerContent = ENV.APP.BANNER_CONTENT;
  const originalBannerType = ENV.APP.BANNER_TYPE;

  hooks.afterEach(function () {
    ENV.APP.BANNER_CONTENT = originalBannerContent;
    ENV.APP.BANNER_TYPE = originalBannerType;
  });

  test('should not display the banner when no banner content', async function (assert) {
    // given
    ENV.APP.BANNER_CONTENT = '';
    ENV.APP.BANNER_TYPE = '';

    // when
    await render(hbs`<CommunicationBanner />`);

    // then
    assert.dom(find('.pix-banner')).doesNotExist();
  });

  test('should display the information banner', async function (assert) {
    // given
    ENV.APP.BANNER_CONTENT = 'information banner text ...';
    ENV.APP.BANNER_TYPE = 'information';

    // when
    await render(hbs`<CommunicationBanner />`);

    // then
    assert.dom(find('.pix-banner--information')).exists();
    assert.dom(find('.pix-banner--information').textContent).hasText('information banner text ...');
  });
});
