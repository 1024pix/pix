import PixBanner from '@1024pix/pix-ui/components/pix-banner';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class LanguageAvailabilityBanner extends Component {
  @service session;

  get shouldDisplayBanner() {
    const localeNotSupported = this.session?.data?.localeNotSupported;
    const localeNotSupportedBannerClosed = this.session?.data?.localeNotSupportedBannerClosed;

    return localeNotSupported && !localeNotSupportedBannerClosed;
  }

  @action
  closeBanner() {
    this.session.updateDataAttribute('localeNotSupportedBannerClosed', true);
  }

  <template>
    {{#if this.shouldDisplayBanner}}
      <PixBanner @type="information" @canCloseBanner="true" @onCloseBannerTriggerAction={{this.closeBanner}}>
        {{t "banners.language-availability.message"}}
      </PixBanner>
    {{/if}}
  </template>
}
