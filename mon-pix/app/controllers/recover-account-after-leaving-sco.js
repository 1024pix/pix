import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class RecoverAccountAfterLeavingScoController extends Controller {

  @tracked showRecoverAccountStudentInformationForm = true;
  @tracked showRecoverAccountConflictError = false;

  firstName;

  @action
  async submitStudentInformation(studentInformation) {
    const studentInformationToSave = this.store.createRecord('student-information', studentInformation);
    this.firstName = studentInformation.firstName;
    try {
      await studentInformationToSave.submitStudentInformation();
    } catch (err) {
      this._handleError(err);
    }
  }

  _handleError(err) {
    const status = err.errors?.[0]?.status;

    if (status === '409') {
      this.showRecoverAccountStudentInformationForm = false;
      this.showRecoverAccountConflictError = true;
    }
  }
}
