import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'mon-pix/config/environment';

describe('Integration | Component | warning-banner', function() {
  setupRenderingTest();

  const warningBannerContent = ENV.APP.WARNING_BANNER_CONTENT;

  afterEach(function() {
    ENV.APP.WARNING_BANNER_CONTENT = warningBannerContent;
  });

  it('should not display the banner when no banner content', async function() {
    // given
    ENV.APP.WARNING_BANNER_CONTENT = '';

    // when
    await render(hbs`<WarningBanner />`);

    // then
    expect(find('.warning-banner')).to.not.exist;
  });

  it('should display the banner when in staging', async function() {
    // given
    ENV.APP.WARNING_BANNER_CONTENT = 'banner text ...';

    // when
    await render(hbs`<WarningBanner />`);

    // then
    expect(find('.warning-banner')).to.exist;
    expect(find('.warning-banner').textContent).to.contain(ENV.APP.WARNING_BANNER_CONTENT);
  });

});
