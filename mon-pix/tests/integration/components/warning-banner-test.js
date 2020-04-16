import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'mon-pix/config/environment';

describe('Integration | Component | warning-banner', function() {
  setupRenderingTest();

  const originalIsStagingBannerEnabled = ENV.APP.IS_STAGING_BANNER_ENABLED;

  afterEach(function() {
    ENV.APP.IS_STAGING_BANNER_ENABLED = originalIsStagingBannerEnabled;
  });

  it('should not display the banner when not in staging', async function() {
    // given
    ENV.APP.IS_STAGING_BANNER_ENABLED = false;

    // when
    await render(hbs`<WarningBanner />`);

    // then
    expect(find('.warning-banner')).to.not.exist;
  });

  it('should display the banner when in staging', async function() {
    // given
    ENV.APP.IS_STAGING_BANNER_ENABLED = true;

    // when
    await render(hbs`<WarningBanner />`);

    // then
    expect(find('.warning-banner')).to.exist;
  });
});
