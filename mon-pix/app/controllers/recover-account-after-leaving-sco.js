import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

class StudentInformationForAccountRecovery {
  @tracked firstName = '' ;
  @tracked lastName = '';
  @tracked username = '';
  @tracked email = '';
  @tracked latestOrganizationName = '';

}

export default class RecoverAccountAfterLeavingScoController extends Controller {

  @tracked showRecoverAccountStudentInformationForm = true;
  @tracked showRecoverAccountConflictError = false;
  @tracked showRecoverAccountConfirmationStep = false;
  @tracked showRecoverAccountBackupEmailConfirmationForm = false;

  studentInformationForAccountRecovery = new StudentInformationForAccountRecovery();
  @tracked firstName;

  @action
  async submitStudentInformation(studentInformation) {
    const studentInformationToSave = this.store.createRecord('student-information', studentInformation);
    this.firstName = studentInformation.firstName;
    try {
      const { firstName, lastName, username, email, latestOrganizationName } = await studentInformationToSave.submitStudentInformation();
      this.studentInformationForAccountRecovery.firstName = firstName;
      this.studentInformationForAccountRecovery.lastName = lastName;
      this.studentInformationForAccountRecovery.username = username;
      this.studentInformationForAccountRecovery.email = email;
      this.studentInformationForAccountRecovery.latestOrganizationName = latestOrganizationName;

      this.showRecoverAccountStudentInformationForm = false;
      this.showRecoverAccountConfirmationStep = true;
    } catch (err) {
      this._handleError(err);
    }
  }

  @action
  continueAccountRecoveryBackupEmailConfirmation() {
    this.showRecoverAccountStudentInformationForm = false;
    this.showRecoverAccountConfirmationStep = false;
    this.showRecoverAccountBackupEmailConfirmationForm = true;
  }

  @action
  cancelAccountRecovery() {
    this.showRecoverAccountConfirmationStep = false;
    this.showRecoverAccountStudentInformationForm = true;
    this.showRecoverAccountBackupEmailConfirmationForm = false;
  }

  _handleError(err) {
    const status = err.errors?.[0]?.status;

    if (status === '409') {
      this.showRecoverAccountStudentInformationForm = false;
      this.showRecoverAccountConflictError = true;
    } else {
      console.log(err);
    }
  }
}
