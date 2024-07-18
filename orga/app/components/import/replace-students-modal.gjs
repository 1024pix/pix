import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class ReplaceStudentsModal extends Component {
  @tracked allowDeletion = false;

  @action
  giveDeletionPermission() {
    this.allowDeletion = !this.allowDeletion;
  }

  <template>
    <PixModal
      @title={{t "pages.sup-organization-participants.replace-students-modal.title"}}
      @showModal={{@display}}
      @onCloseButtonClick={{@onClose}}
    >
      <:content>
        <div class="replace-students-modal">
          <p class="replace-students-modal__content">
            {{t "pages.sup-organization-participants.replace-students-modal.main-content"}}
          </p>
          <p class="replace-students-modal__content">
            {{t "pages.sup-organization-participants.replace-students-modal.footer-content"}}
          </p>
          <p class="replace-students-modal__content">
            <strong>{{t "pages.sup-organization-participants.replace-students-modal.last-warning"}}</strong>
          </p>
          <PixCheckbox @size="small" @checked={{this.allowDeletion}} {{on "click" this.giveDeletionPermission}}>
            <:label><strong>{{t
                  "pages.sup-organization-participants.replace-students-modal.confirmation-checkbox"
                }}</strong></:label>
          </PixCheckbox>
        </div>
      </:content>
      <:footer>
        <PixButton @triggerAction={{@onClose}} @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>
        {{#if this.allowDeletion}}
          <PixButtonUpload
            @id="students-file-upload-replace"
            @onChange={{@onReplaceStudents}}
            @variant="error"
            accept={{@supportedFormats}}
          >
            {{t "pages.sup-organization-participants.replace-students-modal.confirm"}}
          </PixButtonUpload>
        {{else}}
          <PixButton
            @id="students-file-upload-replace"
            @triggerAction={{(@onReplaceStudents)}}
            @isDisabled={{true}}
            @variant="error"
          >
            {{t "pages.sup-organization-participants.replace-students-modal.confirm"}}
          </PixButton>
        {{/if}}
      </:footer>
    </PixModal>
  </template>
}
