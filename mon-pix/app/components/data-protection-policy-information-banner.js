import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import isEmpty from 'lodash/isEmpty';
import ENV from 'mon-pix/config/environment';

export default class DataProtectionPolicyInformationBanner extends Component {
  @service currentUser;
  @service currentDomain;
  @service intl;
  @service url;

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
    return this.url.dataProtectionPolicyUrl;
  }

  @action
  async validateLastDataProtectionPolicy() {
    await this.currentUser.user.save({
      adapterOptions: { rememberUserHasSeenLastDataProtectionPolicyInformation: true },
    });
  }
}
