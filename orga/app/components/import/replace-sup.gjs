import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import ImportCard from './import-card';
import ReplaceStudentsModal from './replace-students-modal';

export default class ReplaceSup extends Component {
  @tracked displayModal = false;
  @service intl;

  get acceptedFileType() {
    const types = this.args.supportedFormats.join(
      this.intl.t('pages.organization-participants-import.file-type-separator'),
    );
    return this.intl.t('pages.organization-participants-import.supported-formats', { types });
  }

  @action
  toggleModal() {
    this.displayModal = !this.displayModal;
  }

  <template>
    <ImportCard @cardTitle={{t "pages.organization-participants-import.actions.replace.title"}}>
      <:cardDetails> {{t "pages.organization-participants-import.actions.replace.details"}}</:cardDetails>
      <:cardFooter>
        <PixButton
          @triggerAction={{this.toggleModal}}
          @isDisabled={{@disabled}}
          @size="small"
          aria-describedby="accepted-files-replace"
        >
          {{t "pages.organization-participants-import.actions.replace.label"}}
        </PixButton>
        <p class="import-card__accepted-files" id="accepted-files-replace">
          {{this.acceptedFileType}}
        </p>
      </:cardFooter>
    </ImportCard>
    <ReplaceStudentsModal
      @onClose={{this.toggleModal}}
      @display={{this.displayModal}}
      @onReplaceStudents={{@importHandler}}
      @supportedFormats={{@supportedFormats}}
    />
  </template>
}
