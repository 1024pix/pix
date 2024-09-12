import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CandidateEditionModal extends Component {
  closeModal = () => {
    this.args.candidate.rollbackAttributes();
    this.args.closeModal();
  };

  <template>
    <PixModal
      @title={{t 'pages.sessions.detail.candidates.edit-modal.title'}}
      class='edit-candidate-modal'
      @showModal={{@showModal}}
      @onCloseButtonClick={{this.closeModal}}
    >
      <:content>
        <form id='edit-candidate-form' class='edit-candidate-modal__form' {{on 'submit' @updateCandidate}}>
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
            <span id='adjustment-details'>{{t
                'pages.sessions.detail.candidates.edit-modal.accessibility-adjustment.details'
              }}</span>
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
