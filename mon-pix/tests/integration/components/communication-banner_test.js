import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'mon-pix/config/environment';

describe('Integration | Component | communication-banner', function () {
  setupIntlRenderingTest();

  const originalBannerContent = ENV.APP.BANNER_CONTENT;
  const originalBannerType = ENV.APP.BANNER_TYPE;

  afterEach(function () {
    ENV.APP.BANNER_CONTENT = originalBannerContent;
    ENV.APP.BANNER_TYPE = originalBannerType;
  });

  it('should not display the banner when no banner content', async function () {
    // given
    ENV.APP.BANNER_CONTENT = '';
    ENV.APP.BANNER_TYPE = '';

    // when
    await render(hbs`<CommunicationBanner />`);

    // then
    expect(find('.pix-banner')).to.not.exist;
  });

  it('should display the information banner', async function () {
    // given
    ENV.APP.BANNER_CONTENT = 'information banner text ...';
    ENV.APP.BANNER_TYPE = 'information';

    // when
    await render(hbs`<CommunicationBanner />`);

    // then
    expect(find('.pix-banner--information')).to.exist;
    expect(find('.pix-banner--information').textContent).to.contain('information banner text ...');
  });
});
