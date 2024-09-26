import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

export default class GenerateUsernamePasswordModal extends Component {
  get isEnabled() {
    return this.args.totalAffectedStudents > 0;
  }

  <template>
    <PixModal
      @title={{t "pages.sco-organization-participants.generate-username-password-modal.title"}}
      @showModal={{@showModal}}
      @onCloseButtonClick={{@onCloseModal}}
    >
      <:content>
        <section class="generate-username-password-modal__content">
          <PixMessage @type="warning" @withIcon={{true}}>{{t
              "pages.sco-organization-participants.generate-username-password-modal.warning-message"
            }}</PixMessage>
          <p>{{t "pages.sco-organization-participants.generate-username-password-modal.content-message-1"}}</p>
          <p>{{t "pages.sco-organization-participants.generate-username-password-modal.content-message-2"}}</p>
          <p>{{t "pages.sco-organization-participants.generate-username-password-modal.content-message-3"}}</p>
        </section>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{@onCloseModal}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{@onTriggerAction}} @isDisabled={{not this.isEnabled}}>
          {{t "common.actions.confirm"}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
