import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UserCertificationsDetailHeader extends Component {
  @service intl;
  @service intlDateFormatter;
  @service fileSaver;
  @service session;

  @tracked tooltipText = this.intl.t('pages.certificate.verification-code.copy');

  get birthdate() {
    return this.intlDateFormatter.formatDateStringToISO(this.args.certification.birthdate);
  }

  @action
  clipboardSuccess() {
    this.tooltipText = this.intl.t('pages.certificate.verification-code.copied');
  }

  @action
  downloadAttestation() {
    const certifId = this.args.certification.id;
    const url = `/api/attestation/${certifId}`;
    const fileName = 'attestation_pix.pdf';
    const token = this.session.data.authenticated.access_token;
    this.fileSaver.save({ url, fileName, token });
  }
}
