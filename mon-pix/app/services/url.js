import { service } from '@ember/service';

import UrlBaseService from './url-base.js';

export default class Url extends UrlBaseService {
  @service intl;

  get showcase() {
    const linkText = this.intl.t('navigation.showcase-homepage', { tld: this.currentDomain.getExtension() });
    return { url: this.getPixWebsiteUrl(), linkText };
  }

  get cguUrl() {
    return this.getPixWebsiteUrlFor('CGU');
  }

  get legalNoticeUrl() {
    return this.getPixWebsiteUrlFor('LEGAL_NOTICE');
  }

  get dataProtectionPolicyUrl() {
    return this.getPixWebsiteUrlFor('DATA_PROTECTION_POLICY');
  }

  get accessibilityUrl() {
    return this.getPixWebsiteUrlFor('ACCESSIBILITY');
  }

  get supportHomeUrl() {
    return this.getPixWebsiteUrlFor('SUPPORT');
  }

  get certificationResultsExplanationUrl() {
    return this.getPixWebsiteUrlFor('CERTIFICATION_RESULTS_EXPLANATION');
  }

  get certificationHowToUrl() {
    return this.getPixWebsiteUrlFor('CERTIFICATION_HOW_TO');
  }

  getLegalDocumentUrl(path) {
    return this.getPixWebsiteUrl(path);
  }
}
