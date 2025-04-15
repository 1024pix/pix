import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import parseISODateOnly from '../../utils/parse-iso-date-only';

export default class UserCertificationsDetailHeader extends Component {
  @service intl;
  @service fileSaver;
  @service session;
  @service currentDomain;
  @service currentUser;
  @service url;

  @tracked tooltipText = this.intl.t('pages.certificate.verification-code.copy');
  @tracked attestationDownloadErrorMessage = null;

  get birthdateMidnightLocalTime() {
    return parseISODateOnly(this.args.certification.birthdate);
  }

  get isUserFrenchReader() {
    return this.currentUser.user && this.currentUser.user.lang === 'fr';
  }

  get displayCertificationResultsExplanation() {
    return this.args.certification.isV3 && (this.currentDomain.isFranceDomain || this.isUserFrenchReader);
  }

  get certificationResultsExplanationUrl() {
    return this.url.certificationResultsExplanationUrl;
  }

  @action
  clipboardSuccess() {
    this.tooltipText = this.intl.t('pages.certificate.verification-code.copied');
  }

  @action
  async downloadAttestation() {
    this.attestationDownloadErrorMessage = null;
    const certificationId = this.args.certification.id;
    const lang = this.intl.primaryLocale;

    const url = `/api/attestation/${certificationId}?isFrenchDomainExtension=${this.currentDomain.isFranceDomain}&lang=${lang}`;

    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch {
      this.attestationDownloadErrorMessage = this.intl.t('common.error');
    }
  }
}
