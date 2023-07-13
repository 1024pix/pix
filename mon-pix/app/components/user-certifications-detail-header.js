import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import parseISODateOnly from '../utils/parse-iso-date-only';

export default class UserCertificationsDetailHeader extends Component {
  @service intl;
  @service fileSaver;
  @service session;
  @service currentDomain;

  @tracked tooltipText = this.intl.t('pages.certificate.verification-code.copy');
  @tracked attestationDownloadErrorMessage = null;

  get birthdateMidnightLocalTime() {
    return parseISODateOnly(this.args.certification.birthdate);
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
    } catch (error) {
      this.attestationDownloadErrorMessage = error.message;
    }
  }
}
