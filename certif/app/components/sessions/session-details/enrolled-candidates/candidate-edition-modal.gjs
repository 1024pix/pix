import { PixButton, PixCheckbox, PixInput, PixModal, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CandidateEditionModal extends Component {
  @service pixMetrics;

  closeModal = () => {
    this.args.candidate.rollbackAttributes();
    this.args.closeModal();
  };

  handleFormSubmit = (event) => {
    event.preventDefault();

    this.args.updateCandidate();

    if (this.args.candidate.accessibilityAdjustmentNeeded) {
      this.pixMetrics.trackEvent('certifCandidateAccessibilityAdjustmentNeeded');
    }
  };

  <template>
    <PixModal
      @title={{t 'pages.sessions.detail.candidates.edit-modal.title'}}
      class='edit-candidate-modal'
      @showModal={{@showModal}}
      @onCloseButtonClick={{this.closeModal}}
    >
      <:content>
        <form id='edit-candidate-form' class='edit-candidate-modal__form' {{on 'submit' this.handleFormSubmit}}>
          <div class='edit-candidate-modal-form__disabled-fields'>
            <PixInput @id='last-name' autocomplete='off' disabled='true' value={{@candidate.lastName}}>
              <:label>{{t 'common.labels.candidate.birth-name'}}</:label>
            </PixInput>
            <PixInput @id='first-name' autocomplete='off' disabled='true' value={{@candidate.firstName}}>
              <:label>{{t 'common.labels.candidate.firstname'}}</:label>
            </PixInput>
          </div>

          <fieldset class='edit-candidate-modal-form__accessibility-adjustment'>
            <legend class='edit-candidate-modal-form-accessibility-adjustment__legend'>{{t
                'pages.sessions.detail.candidates.edit-modal.accessibility-adjustment.title'
              }}</legend>
            <PixNotificationAlert
              @withIcon={{true}}
              class='edit-candidate-modal-form-accessibility-adjustment__description'
            >
              {{t 'pages.sessions.detail.candidates.edit-modal.accessibility-adjustment.details' htmlSafe=true}}
            </PixNotificationAlert>
            <PixCheckbox
              aria-describedby='adjustment-details'
              @checked={{@candidate.accessibilityAdjustmentNeeded}}
              {{on 'change' (fn @updateCandidateDataFromValue @candidate 'accessibilityAdjustmentNeeded')}}
            >
              <:label>
                {{t 'pages.sessions.detail.candidates.edit-modal.accessibility-adjustment.label'}}
              </:label>
            </PixCheckbox>
          </fieldset>
        </form>
      </:content>
      <:footer>
        <PixButton @triggerAction={{this.closeModal}} @variant='secondary' @isBorderVisible='true'>
          {{t 'common.actions.cancel'}}
        </PixButton>
        <PixButton @type='submit' form='edit-candidate-form'>
          {{t 'common.actions.update'}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
