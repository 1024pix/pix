import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';
import isEmpty from 'lodash/isEmpty';

export default class DataProtectionPolicyInformationBanner extends Component {
  @service currentUser;
  @service currentDomain;
  @service intl;

  bannerType = ENV.APP.BANNER_TYPE;
  _rawBannerContent = ENV.APP.BANNER_CONTENT;

  get shouldDisplayDataProtectionPolicyInformation() {
    const hasNotAlreadySeenDataProtectionPolicyInformation =
      this.currentUser.user.lastDataProtectionPolicySeenAt === null;

    const isNotAStudent = this.currentUser.user.cgu === true;

    const isCommunicationBannerDisplayed = !isEmpty(this._rawBannerContent) && !isEmpty(this.bannerType);

    return hasNotAlreadySeenDataProtectionPolicyInformation && isNotAStudent && !isCommunicationBannerDisplayed;
  }

  get dataProtectionPolicyUrl() {
    const currentLanguage = this.intl.t('current-lang');
    if (currentLanguage === 'en') {
      return 'https://pix.org/en-gb/personal-data-protection-policy';
    }
    return `https://pix.${this.currentDomain.getExtension()}/politique-protection-donnees-personnelles-app`;
  }
}
