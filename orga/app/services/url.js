import { service } from '@ember/service';
import ENV from 'pix-orga/config/environment';

import UrlBaseService from './url-base.js';

export default class Url extends UrlBaseService {
  @service currentDomain;
  @service currentUser;

  get legalNoticeUrl() {
    return this.getPixWebsiteUrlFor('LEGAL_NOTICE');
  }

  get cguUrl() {
    return this.getPixWebsiteUrlFor('CGU');
  }

  get dataProtectionPolicyUrl() {
    return this.getPixWebsiteUrl('pix-app-privacy-policy');
  }

  get accessibilityUrl() {
    return this.getPixWebsiteUrlFor('ACCESSIBILITY_ORGA');
  }

  get supportHomeUrl() {
    return this.getPixWebsiteUrlFor('SUPPORT');
  }

  get supportHelpCenterUrl() {
    const locale = this.locale.currentLocale;
    const orgType = this.currentUser.organization?.type ?? 'PRO';

    if (orgType === 'SCO-1D') {
      if (locale === 'fr-FR') {
        return this.getPixWebsiteUrl('support/enseignement-scolaire/1er-degre');
      }
      if (['fr', 'nl-BE', 'fr-BE'].includes(locale)) {
        return this.getPixWebsiteUrl('support');
      }
      return 'https://pix.org/en/support';
    }

    if (orgType === 'SCO' && locale === 'fr-FR') {
      return this.getPixWebsiteUrl('support/enseignement-scolaire');
    }

    if (['fr', 'fr-FR', 'fr-BE'].includes(locale)) {
      return 'https://contact.pix.org/fr/hc/1137130200';
    }

    if (locale === 'nl-BE') {
      return 'https://pix.org/nl-be/support';
    }

    return 'https://pix.org/en/support';
  }

  get campaignsRootUrl() {
    if (ENV.APP.CAMPAIGNS_ROOT_URL) return ENV.APP.CAMPAIGNS_ROOT_URL;
    return `${this.pixAppUrl}/campagnes/`;
  }

  get combinedCoursesRootUrl() {
    if (ENV.APP.COMBINED_COURSES_ROOT_URL) return ENV.APP.COMBINED_COURSES_ROOT_URL;
    return `${this.pixAppUrl}/parcours/`;
  }

  get pixJuniorSchoolUrl() {
    const schoolCode = this.currentUser.organization.schoolCode;
    if (!schoolCode) return '';

    return `${this.currentDomain.getJuniorBaseUrl()}/schools/${schoolCode}`;
  }

  get pixJuniorUrl() {
    return this.currentDomain.getJuniorBaseUrl();
  }

  getLegalDocumentUrl(path) {
    return this.getPixWebsiteUrl(path);
  }
}
