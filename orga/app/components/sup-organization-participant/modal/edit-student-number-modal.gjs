import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class EditStudentNumberModal extends Component {
  @service pixToast;
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
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.sup-organization-participants.edit-student-number-modal.form.success', {
          firstName: this.args.student.firstName,
          lastName: this.args.student.lastName,
        }),
      });
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

  <template>
    <PixModal
      @title={{t "pages.sup-organization-participants.edit-student-number-modal.title"}}
      @showModal={{@display}}
      @onCloseButtonClick={{this.close}}
    >
      <:content>
        <div class="edit-student-number-modal">
          {{#if @student.studentNumber}}
            <p>
              {{t
                "pages.sup-organization-participants.edit-student-number-modal.form.student-number"
                firstName=@student.firstName
                lastName=@student.lastName
              }}<span class="edit-student-number-modal__student-number">{{@student.studentNumber}}</span></p>
          {{/if}}

          <div class="input-container">
            <PixInput @id="editStudentNumber" {{on "change" this.setStudentNumber}}>
              <:label>{{t
                  "pages.sup-organization-participants.edit-student-number-modal.form.new-student-number-label"
                }}</:label>
            </PixInput>

            <div class="form__error error-message">
              {{this.error}}
            </div>
          </div>
        </div>
      </:content>
      <:footer>
        <PixButton @triggerAction={{this.close}} @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>

        <PixButton @triggerAction={{this.updateStudentNumber}} @isDisabled={{this.isDisabled}}>
          {{t "pages.sup-organization-participants.edit-student-number-modal.actions.update"}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
