import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class CompanionLiveAlertModal extends Component {
  @service intl;

  @action
  title() {
    return this.intl.t('pages.session-supervising.candidate-in-list.modals.live-alerts.companion.title', {
      candidateFullName: this.args.candidateFullName,
    });
  }

  @action
  onClose() {
    this.args.closeConfirmationModal();
  }

  @action
  onSubmit() {
    this.args.clearedLiveAlert();
  }

  <template>
    <PixModal @title={{this.title}} @onCloseButtonClick={{@closeConfirmationModal}} @showModal={{@showModal}}>
      <:content>
        <p>{{t 'pages.session-supervising.candidate-in-list.modals.live-alerts.companion.description'}}</p>
      </:content>

      <:footer>
        <PixButton @triggerAction={{this.onClose}} @variant='secondary' @isBorderVisible={{true}}>{{t
            'common.actions.cancel'
          }}</PixButton>
        <PixButton
          @triggerAction={{this.onSubmit}}
          aria-label={{t
            'pages.session-supervising.candidate-in-list.modals.live-alerts.companion.actions.success-aria-label'
          }}
        >{{t 'common.actions.confirm'}}</PixButton>
      </:footer>
    </PixModal>
  </template>
}
