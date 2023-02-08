import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

class StudentInformationForAccountRecovery {
  @tracked firstName = '';
  @tracked ineIna = '';
  @tracked lastName = '';
  @tracked username = '';
  @tracked email = '';
  @tracked birthdate;
  @tracked latestOrganizationName = '';
}

export default class FindScoRecordController extends Controller {
  @service intl;
  @service store;

  @tracked accountRecoveryError = {
    message: '',
    title: '',
    showBackToHomeButton: false,
  };

  @tracked showStudentInformationForm = true;
  @tracked showErrors = false;
  @tracked showConfirmationStep = false;
  @tracked showBackupEmailConfirmationForm = false;
  @tracked showAccountNotFoundError = false;
  @tracked showAlreadyRegisteredEmailError = false;
  @tracked showConfirmationEmailSent = false;
  @tracked templateImg = 'illustration';

  @tracked studentInformationForAccountRecovery = new StudentInformationForAccountRecovery();

  @tracked isLoading = false;

  @action
  async submitStudentInformation(studentInformation) {
    this.studentInformationForAccountRecovery.birthdate = studentInformation.birthdate;
    this.studentInformationForAccountRecovery.ineIna = studentInformation.ineIna;
    this.studentInformationForAccountRecovery.firstName = studentInformation.firstName;
    const studentInformationToSave = this.store.createRecord('student-information', studentInformation);
    try {
      const { firstName, lastName, username, email, latestOrganizationName } =
        await studentInformationToSave.submitStudentInformation();
      this.studentInformationForAccountRecovery.firstName = firstName;
      this.studentInformationForAccountRecovery.lastName = lastName;
      this.studentInformationForAccountRecovery.username = username;
      this.studentInformationForAccountRecovery.email = email;
      this.studentInformationForAccountRecovery.latestOrganizationName = latestOrganizationName;

      this.showStudentInformationForm = false;
      this.showAccountNotFoundError = false;
      this.showConfirmationStep = true;
    } catch (err) {
      this._handleError(err);
    }
  }

  @action
  async resetErrors() {
    this.showAlreadyRegisteredEmailError = false;
  }

  @action
  async sendEmail(newEmail) {
    const { firstName, lastName, ineIna, birthdate } = this.studentInformationForAccountRecovery;
    const accountRecoveryDemand = this.store.createRecord('account-recovery-demand', {
      firstName,
      lastName,
      ineIna,
      birthdate,
      email: newEmail,
    });
    try {
      this.isLoading = true;
      await accountRecoveryDemand.send();
      this.showAlreadyRegisteredEmailError = false;
      this.showBackupEmailConfirmationForm = false;
      this.showConfirmationEmailSent = true;
      this.templateImg = 'boite';
    } catch (err) {
      this._handleError(err);
    } finally {
      this.isLoading = false;
    }
  }

  @action
  continueAccountRecoveryBackupEmailConfirmation() {
    this.showStudentInformationForm = false;
    this.showConfirmationStep = false;
    this.showBackupEmailConfirmationForm = true;
  }

  @action
  cancelAccountRecovery() {
    this.showConfirmationStep = false;
    this.showStudentInformationForm = true;
    this.showBackupEmailConfirmationForm = false;
  }

  _handleError(err) {
    const { status: stringStatus, code } = err.errors?.[0] || {};
    const status = parseInt(stringStatus);
    const isApiUnreachable = isNaN(status);
    const hasInternalErrorOrConflictOrAlreadyLeftSco =
      status === 403 || status === 409 || status >= 500 || isApiUnreachable;
    const isEmailAlreadyRegistered =
      this.showBackupEmailConfirmationForm && status === 400 && code === 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS';

    if (!hasInternalErrorOrConflictOrAlreadyLeftSco || isEmailAlreadyRegistered) {
      this._showErrorOnComponent(isEmailAlreadyRegistered);
    } else {
      this._showErrorPage(status, code);
    }
  }

  _showErrorOnComponent(isEmailAlreadyRegistered) {
    this.showAlreadyRegisteredEmailError = isEmailAlreadyRegistered;
    this.showAccountNotFoundError = !isEmailAlreadyRegistered;
  }

  _showErrorPage(status, code) {
    const errorDetails = {
      403: {
        message: this.intl.t('pages.account-recovery.errors.key-used'),
        title: this.intl.t('pages.account-recovery.errors.title'),
        showBackToHomeButton: true,
      },
      409: {
        message: this.intl.t('pages.account-recovery.find-sco-record.conflict.warning'),
        title: this.intl.t('pages.account-recovery.find-sco-record.conflict.found-you-but', {
          firstName: this.studentInformationForAccountRecovery.firstName,
        }),
        showBackToHomeButton: false,
      },
    };

    const internalError = {
      message: this.intl.t('common.api-error-messages.internal-server-error'),
      title: this.intl.t('pages.account-recovery.errors.title'),
      showBackToHomeButton: true,
    };

    this.showStudentInformationForm = false;
    this.showAccountNotFoundError = false;
    this.showBackupEmailConfirmationForm = false;
    this.showAlreadyRegisteredEmailError = false;
    this.showErrors = true;
    this.accountRecoveryError = errorDetails[status] || errorDetails[code] || internalError;
  }
}
