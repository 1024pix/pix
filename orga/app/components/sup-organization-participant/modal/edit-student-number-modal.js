import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class EditStudentNumberModal extends Component {
  @service notifications;
  @service intl;

  @tracked error = null;
  @tracked newStudentNumber = null;

  get isDisabled() {
    const emptyValues = ['', null];
    return emptyValues.includes(this.newStudentNumber);
  }

  @action
  async updateStudentNumber(event) {
    event.preventDefault();
    const validatedStudentNumber = this.newStudentNumber.trim();
    if (!validatedStudentNumber) {
      return (this.error = this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.error'));
    }
    try {
      await this.args.onSubmit(validatedStudentNumber);
      this.notifications.sendSuccess(
        this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.success', {
          firstName: this.args.student.firstName,
          lastName: this.args.student.lastName,
        }),
      );
      this.close();
    } catch (errorResponse) {
      this._handleError(errorResponse);
    }
  }

  @action
  setStudentNumber(event) {
    this.newStudentNumber = event.target.value;
  }

  @action
  close() {
    this._resetInput();
    this.args.onClose();
  }

  _handleError(errorResponse) {
    errorResponse.errors.forEach((error) => {
      if (error.detail === 'STUDENT_NUMBER_EXISTS') {
        return (this.error = this.intl.t('api-error-messages.edit-student-number.student-number-exists', {
          firstName: this.args.student.firstName,
          lastName: this.args.student.lastName,
        }));
      }
      throw error;
    });
  }

  _resetInput() {
    this.newStudentNumber = null;
    this.error = null;
  }
}
