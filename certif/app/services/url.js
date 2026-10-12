import { service } from '@ember/service';

import UrlBaseService from './url-base.js';

export default class Url extends UrlBaseService {
  @service currentUser;
  @service intl;
  @service locale;

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
    return this.getPixWebsiteUrlFor('ACCESSIBILITY_CERTIF');
  }

  get supportUrl() {
    return this.getPixWebsiteUrlFor('SUPPORT');
  }

  get joiningIssueSheetUrl() {
    if (this.locale.currentLanguage === 'fr') {
      return 'https://cloud.pix.fr/s/QcKnpcTya5iWF5C';
    }

    return 'https://cloud.pix.fr/s/aZRMYipSLREiBXP';
  }

  get documentationUrl() {
    if (this.locale.currentLanguage === 'fr') {
      if (this.currentUser.currentAllowedCertificationCenterAccess.isScoManagingStudents) {
        return 'https://cloud.pix.fr/s/opiFxfjygR76S8y';
      }
      return 'https://cloud.pix.fr/s/ypq3K7GmgpEdwop';
    }
    return 'https://cloud.pix.fr/s/c6SmQ8iM6nGbrzw';
  }

  get urlToDownloadSessionIssueReportSheet() {
    if (this.locale.currentLanguage === 'fr') {
      return 'https://cloud.pix.fr/s/B76yA8ip9Radej9/download';
    }
    return 'https://cloud.pix.fr/s/B6egBZnbjJFSiaN';
  }

  get urlToDownloadSessionV3IssueReportSheet() {
    if (this.locale.currentLanguage === 'fr') {
      return 'https://cloud.pix.fr/s/ff8sYPWPyCo3MrN/download';
    }
    return 'https://cloud.pix.fr/s/B6egBZnbjJFSiaN';
  }

  get fraudFormUrl() {
    return 'https://form-eu.123formbuilder.com/41052/form';
  }

  get fraudReportUrl() {
    if (this.locale.currentLanguage === 'fr') {
      return 'https://cloud.pix.fr/s/H3QdaLzdaap4zr8/download';
    }
    return 'https://cloud.pix.fr/s/iagftYbDFC8Wb4e/download';
  }

  get invigilatorDocumentationUrl() {
    if (this.locale.currentLanguage === 'fr') {
      return 'https://cloud.pix.fr/s/8xB82zdPKYSZzaM';
    }

    return 'https://cloud.pix.fr/s/Mfd2ggwGHwmprA4';
  }

  getLegalDocumentUrl(path) {
    return this.getPixWebsiteUrl(path);
  }
}
