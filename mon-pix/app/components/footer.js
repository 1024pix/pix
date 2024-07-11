import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Footer extends Component {
  @service url;
  @service intl;
  @service currentDomain;

  get shouldShowTheMarianneLogo() {
    return this.currentDomain.isFranceDomain;
  }

  get shouldDisplayStudentDataProtectionPolicyLink() {
    return this.currentDomain.isFranceDomain;
  }

  get currentYear() {
    const date = new Date();
    return date.getFullYear().toString();
  }

  get cguUrl() {
    return this.url.cguUrl;
  }

  get legalNoticeUrl() {
    return this.url.legalNoticeUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  get accessibilityUrl() {
    return this.url.accessibilityUrl;
  }

  get supportHomeUrl() {
    return this.url.supportHomeUrl;
  }
}
