import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'mon-pix/config/environment';

describe('Integration | Component | communication-banner', function() {
  setupRenderingTest();

  const originalBannerContent = ENV.APP.BANNER_CONTENT;
  const originalBannerType = ENV.APP.BANNER_TYPE;

  afterEach(function() {
    ENV.APP.BANNER_CONTENT = originalBannerContent;
    ENV.APP.BANNER_TYPE = originalBannerType;
  });

  it('should not display the banner when no banner content', async function() {
    // given
    ENV.APP.BANNER_CONTENT = '';
    ENV.APP.BANNER_TYPE = '';

    // when
    await render(hbs`<CommunicationBanner />`);

    // then
    expect(find('.warning-banner')).to.not.exist;
  });

  [
    { bannerContent: 'info banner text ...', bannerType: 'info', bannerClass: '.communication-banner--info' },
    { bannerContent: 'warning banner text ...', bannerType: 'warning', bannerClass: '.communication-banner--warning' },
    { bannerContent: 'error banner text ...', bannerType: 'error', bannerClass: '.communication-banner--error' },
  ].forEach((testCase) => {
    it(`should display the ${testCase.bannerType} banner`, async function() {
      // given
      ENV.APP.BANNER_CONTENT = testCase.bannerContent;
      ENV.APP.BANNER_TYPE = testCase.bannerType;

      // when
      await render(hbs`<CommunicationBanner />`);

      // then
      expect(find(testCase.bannerClass)).to.exist;
      expect(find(testCase.bannerClass).textContent).to.contain(testCase.bannerType);
    });
  });

});
