import Controller from '@ember/controller';
import { action } from '@ember/object';
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

export default class AccountRecoveryAfterLeavingScoController extends Controller {

  @tracked showStudentInformationForm = true;
  @tracked showConflictError = false;
  @tracked showConfirmationStep = false;
  @tracked showBackupEmailConfirmationForm = false;
  @tracked showAccountNotFoundError = false;
  @tracked showAlreadyRegisteredEmailError = false;
  @tracked showConfirmationEmailSent = false;
  @tracked templateImg = 'illustration';

  @tracked studentInformationForAccountRecovery = new StudentInformationForAccountRecovery();

  @action
  async submitStudentInformation(studentInformation) {
    this.studentInformationForAccountRecovery.birthdate = studentInformation.birthdate;
    this.studentInformationForAccountRecovery.ineIna = studentInformation.ineIna;
    this.studentInformationForAccountRecovery.firstName = studentInformation.firstName;
    const studentInformationToSave = this.store.createRecord('student-information', studentInformation);
    try {
      const {
        firstName,
        lastName,
        username,
        email,
        latestOrganizationName,
      } = await studentInformationToSave.submitStudentInformation();
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
    const userId = this.studentInformationForAccountRecovery.userId;
    const accountRecoveryDemand = this.store.createRecord('account-recovery-demand', { userId, email: newEmail });
    try {
      await accountRecoveryDemand.send();
      this.showAlreadyRegisteredEmailError = false;
      this.showBackupEmailConfirmationForm = false;
      this.showConfirmationEmailSent = true;
      this.templateImg = 'boite';
    } catch (err) {
      const status = err.errors?.[0]?.status;

      if (status === '400') {
        this.showAlreadyRegisteredEmailError = true;
      } else {
        console.log(err);
      }
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
    const status = err.errors?.[0]?.status;

    if (status === '409') {
      this.showStudentInformationForm = false;
      this.showAccountNotFoundError = false;
      this.showConflictError = true;
    } else {
      this.showAccountNotFoundError = true;
    }
  }
}
