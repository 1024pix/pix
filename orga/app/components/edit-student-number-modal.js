import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class EditStudentNumberModal extends Component {
  @service notifications;

  @tracked error = null;
  @tracked newStudentNumber = null;

  get isDisabled() {
    const emptyValues = ['', null];
    return emptyValues.includes(this.newStudentNumber);
  }

  @action
  async updateStudentNumber(event) {
    event.preventDefault();
    if (!this.newStudentNumber.trim()) {
      return this.error = 'Le numéro étudiant ne doit pas être vide.';
    }
    try {
      await this.args.onSaveStudentNumber(this.newStudentNumber.trim());
      this.notifications.sendSuccess(`La modification du numéro étudiant ${this.args.student.firstName} ${this.args.student.lastName} a bien été effectué.`);
      this.close();
    } catch (errorResponse) {
      this._handleError(errorResponse);
    }
  }

  @action
  close() {
    this._resetInput();
    this.args.closeModal();
  }

  _handleError(errorResponse) {
    errorResponse.errors.forEach((error) => {
      if (error.status === '412') {
        return this.error = error.detail;
      }
      throw error;
    });
  }

  _resetInput() {
    this.newStudentNumber = null;
    this.error = null;
  }
}
