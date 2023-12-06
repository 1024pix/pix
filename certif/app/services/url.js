import Service, { inject as service } from '@ember/service';

import ENV from 'pix-certif/config/environment';

export default class Url extends Service {
  @service currentDomain;
  @service intl;

  definedHomeUrl = ENV.rootURL;
  pixAppUrlWithoutExtension = ENV.APP.PIX_APP_URL_WITHOUT_EXTENSION;

  get homeUrl() {
    return this.definedHomeUrl;
  }

  get cguUrl() {
    if (this.#isEnglishSpoken()) return 'https://pix.org/en-gb/terms-and-conditions';
    return `https://pix.${this.currentDomain.getExtension()}/conditions-generales-d-utilisation`;
  }

  get dataProtectionPolicyUrl() {
    if (this.#isEnglishSpoken()) return 'https://pix.org/en-gb/personal-data-protection-policy';
    return `https://pix.${this.currentDomain.getExtension()}/politique-protection-donnees-personnelles-app`;
  }

  get forgottenPasswordUrl() {
    let url = `${this.pixAppUrlWithoutExtension}${this.currentDomain.getExtension()}/mot-de-passe-oublie`;
    if (this.#isEnglishSpoken()) {
      url += '?lang=en';
    }
    return url;
  }

  get legalNoticeUrl() {
    if (this.currentDomain.isFranceDomain) return 'https://pix.fr/mentions-legales';

    return this.#isFrenchSpoken() ? 'https://pix.org/fr/mentions-legales' : 'https://pix.org/en-gb/legal-notice';
  }

  get accessibilityUrl() {
    if (this.currentDomain.isFranceDomain) return 'https://pix.fr/accessibilite-pix-certif';

    return this.#isFrenchSpoken()
      ? 'https://pix.org/fr/accessibilite-pix-certif'
      : 'https://pix.org/en-gb/accessibility-pix-certif';
  }

  get supportUrl() {
    if (this.currentDomain.isFranceDomain) return 'https://support.pix.fr';

    return this.#isFrenchSpoken() ? 'https://support.pix.org' : 'https://support.pix.org/en/support/home';
  }

  get joiningIssueSheetUrl() {
    if (this.#isFrenchSpoken()) {
      return 'https://cloud.pix.fr/s/zf3fGimWwPQCeWF/download/Probl%C3%A8mes%20d%27acc%C3%A8s%20en%20session.pdf';
    }

    return 'https://cloud.pix.fr/s/JmBn2q5rpzgrjxN/download';
  }

  get urlToDownloadSessionIssueReportSheet() {
    if (this.#isFrenchSpoken()) {
      return 'https://cloud.pix.fr/s/B76yA8ip9Radej9/download';
    }

    return 'https://cloud.pix.fr/s/ro7jHtsZZbY5SCX/download';
  }

  get urlToDownloadSessionV3IssueReportSheet() {
    return 'https://cloud.pix.fr/s/wJc6N3sZNZRC4MZ/download';
  }

  get fraudFormUrl() {
    return 'https://form-eu.123formbuilder.com/41052/form';
  }

  #isFrenchSpoken() {
    return this.intl.primaryLocale === 'fr';
  }

  #isEnglishSpoken() {
    return this.intl.primaryLocale === 'en';
  }
}
