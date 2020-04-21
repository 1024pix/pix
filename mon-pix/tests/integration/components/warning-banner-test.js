import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'mon-pix/config/environment';

describe('Integration | Component | warning-banner', function() {
  setupRenderingTest();

  const warningBannerContent = ENV.APP.WARNING_BANNER_CONTENT;
  const warningBannerType = ENV.APP.WARNING_BANNER_TYPE;

  afterEach(function() {
    ENV.APP.WARNING_BANNER_CONTENT = warningBannerContent;
    ENV.APP.WARNING_BANNER_TYPE = warningBannerType;
  });

  it('should not display the banner when no banner content', async function() {
    // given
    ENV.APP.WARNING_BANNER_CONTENT = '';
    ENV.APP.WARNING_BANNER_TYPE = '';

    // when
    await render(hbs`<WarningBanner />`);

    // then
    expect(find('.warning-banner')).to.not.exist;
  });

  [
    { warningBannerContent: 'info banner text ...', warningBannerType: 'info', warningBannerClass: '.warning-banner--info' },
    { warningBannerContent: 'warn banner text ...', warningBannerType: 'warn', warningBannerClass: '.warning-banner--warn' },
    { warningBannerContent: 'error banner text ...', warningBannerType: 'error', warningBannerClass: '.warning-banner--error' },
  ].forEach((testCase) => {
    it(`should display the ${testCase.warningBannerType} banner`, async function() {
      // given
      ENV.APP.WARNING_BANNER_CONTENT = testCase.warningBannerContent;
      ENV.APP.WARNING_BANNER_TYPE = testCase.warningBannerType;

      // when
      await render(hbs`<WarningBanner />`);

      // then
      expect(find(testCase.warningBannerClass)).to.exist;
      expect(find(testCase.warningBannerClass).textContent).to.contain(ENV.APP.WARNING_BANNER_CONTENT);
    });
  });

});
