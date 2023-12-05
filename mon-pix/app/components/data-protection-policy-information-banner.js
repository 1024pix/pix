import { service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';
import isEmpty from 'lodash/isEmpty';
import { action } from '@ember/object';

export default class DataProtectionPolicyInformationBanner extends Component {
  @service currentUser;
  @service currentDomain;
  @service intl;

  bannerType = ENV.APP.BANNER_TYPE;
  _rawBannerContent = ENV.APP.BANNER_CONTENT;

  get shouldDisplayDataProtectionPolicyInformation() {
    const isUserLoggedIn = typeof this.currentUser.user !== 'undefined';
    if (!isUserLoggedIn) {
      return false;
    }

    const isCommunicationBannerDisplayed = !isEmpty(this._rawBannerContent) && !isEmpty(this.bannerType);
    if (isCommunicationBannerDisplayed) {
      return false;
    }

    return this.currentUser.user.shouldSeeDataProtectionPolicyInformationBanner;
  }

  get dataProtectionPolicyUrl() {
    const currentLanguage = this.intl.prumaryLocale;
    if (currentLanguage === 'en') {
      return 'https://pix.org/en-gb/personal-data-protection-policy';
    }
    return `https://pix.${this.currentDomain.getExtension()}/politique-protection-donnees-personnelles-app`;
  }

  @action
  async validateLastDataProtectionPolicy() {
    await this.currentUser.user.save({
      adapterOptions: { rememberUserHasSeenLastDataProtectionPolicyInformation: true },
    });
  }
}
