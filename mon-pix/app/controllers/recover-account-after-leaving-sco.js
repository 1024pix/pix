import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class RecoverAccountAfterLeavingScoController extends Controller {

  @tracked showRecoverAccountStudentInformationForm = true;
  @tracked showRecoverAccountConflictError = false;
  @tracked showRecoverAccountConfirmationStep = false;

  studentInformationForAccountRecovery;
  firstName;

  @action
  async submitStudentInformation(studentInformation) {
    const studentInformationToSave = this.store.createRecord('student-information', studentInformation);
    this.firstName = studentInformation.firstName;
    try {
      this.studentInformationForAccountRecovery = await studentInformationToSave.submitStudentInformation();
      this.showRecoverAccountStudentInformationForm = false;
      this.showRecoverAccountConfirmationStep = true;
    } catch (err) {
      this._handleError(err);
    }
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
