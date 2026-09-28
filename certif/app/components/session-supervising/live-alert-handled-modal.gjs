import { PixButton, PixModal, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class LiveAlertHandledModal extends Component {
  @service intl;

  @action
  title() {
    return this.intl.t('pages.session-supervising.candidate-in-list.handle-live-alert-modal.title', {
      candidateFullName: this.args.candidateFullName,
    });
  }

  <template>
    <PixModal
      @class='pix-modal-dialog live-alert-handled-modal'
      @title={{this.title}}
      @onCloseButtonClick={{@closeConfirmationModal}}
      @showModal={{@showModal}}
    >
      <:content>
        <p>
          <PixNotificationAlert @type='success' class='live-alert-handled-modal__success-banner' @withIcon={{true}}>
            {{#if @isLiveAlertValidated}}
              {{t 'pages.session-supervising.candidate-in-list.handle-live-alert-modal.handled.validated-banner'}}
            {{else}}
              {{t 'pages.session-supervising.candidate-in-list.handle-live-alert-modal.handled.rejected-banner'}}
            {{/if}}
          </PixNotificationAlert>
        </p>

        <div class='app-modal-body__warning live-alert-handled-modal__description'>
          <p>
            {{t 'pages.session-supervising.candidate-in-list.handle-live-alert-modal.handled.description'}}
          </p>
        </div>
      </:content>
      <:footer>
        <PixButton
          @triggerAction={{@closeConfirmationModal}}
          aria-label={{t
            'pages.session-supervising.candidate-in-list.handle-live-alert-modal.handled.close-button-label'
          }}
        >
          {{t 'pages.session-supervising.candidate-in-list.handle-live-alert-modal.handled.close-button-text'}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
