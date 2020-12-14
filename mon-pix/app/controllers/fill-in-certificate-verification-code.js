import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class FillInCertificateVerificationCode extends Controller {
  @service store;
  @service intl;

  certificateVerificationCode = null;

  codeRegex = /^P-[0-9A-Z]{8}$/i;

  @tracked
  errorMessage = null;

  @tracked
  showNotFoundCertificationErrorMessage = false;

  @action
  async checkCertificate() {
    this.clearErrors();

    if (!this.certificateVerificationCode) {
      this.errorMessage = this.intl.t(
        'pages.fill-in-certificate-verification-code.errors.missing-code',
      );
      return;
    }

    if (!this.isVerificationCodeValid()) {
      this.errorMessage = this.intl.t(
        'pages.fill-in-certificate-verification-code.errors.wrong-format',
      );
      return;
    }

    try {
      const certification = await this.store.queryRecord('certification', { verificationCode: this.certificateVerificationCode.toUpperCase() });
      return this.transitionToRoute('shared-certification', certification);
    } catch (error) {
      this.onVerificateCertificationCodeError(error);
    }
  }

  onVerificateCertificationCodeError(error) {
    if (error.errors) {
      const { status } = error.errors[0];
      if (status === '404') {
        this.showNotFoundCertificationErrorMessage = true;
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  isVerificationCodeValid() {
    return this.codeRegex.test(this.certificateVerificationCode);
  }

  @action
  clearErrors() {
    this.errorMessage = null;
    this.showNotFoundCertificationErrorMessage = false;
  }
}
