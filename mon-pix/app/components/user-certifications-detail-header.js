import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import parseISODateOnly from '../utils/parse-iso-date-only';

export default class UserCertificationsDetailHeader extends Component {
  @service intl;
  @service fileSaver;
  @service session;
  @service url;

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
    const certifId = this.args.certification.id;
    const url = `/api/attestation/${certifId}?isFrenchDomainExtension=${this.url.isFrenchDomainExtension}`;
    const fileName = 'attestation_pix.pdf';
    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, fileName, token });
    } catch (error) {
      this.attestationDownloadErrorMessage = error.message;
    }
  }
}
