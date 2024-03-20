import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

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
}
