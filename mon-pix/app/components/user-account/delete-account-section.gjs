import { PixButton, PixModal, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

export default class DeleteAccountSection extends Component {
  @service url;
  @service requestManager;
  @service router;

  @tracked modalOpen = false;
  @tracked isLoading = false;
  @tracked globalError;

  get supportHomeUrl() {
    return this.url.supportHomeUrl;
  }

  get hasEmail() {
    return Boolean(this.args.user.email);
  }

  @action
  openModal() {
    this.modalOpen = true;
  }

  @action
  closeModal() {
    this.modalOpen = false;
  }

  @action
  async selfDeleteUserAccount() {
    try {
      await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/users/me`,
        method: 'DELETE',
      });

      this.router.replaceWith('logout');
    } catch (error) {
      if (error.status === 403) {
        this.globalError = 'pages.user-account.delete-account.modal.error-403';
      } else {
        this.globalError = 'common.api-error-messages.internal-server-error';
      }
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <section class="delete-account-section">
      <h2>{{t "pages.user-account.delete-account.title"}}</h2>

      <p class="delete-account-section__content">
        {{#if this.hasEmail}}
          {{t
            "pages.user-account.delete-account.warning-email"
            pixScore=@user.profile.pixScore
            email=@user.email
            htmlSafe=true
          }}
        {{else}}
          {{t
            "pages.user-account.delete-account.warning-other"
            pixScore=@user.profile.pixScore
            firstName=@user.firstName
            lastName=@user.lastName
            htmlSafe=true
          }}
        {{/if}}
      </p>

      <p class="delete-account-section__content">
        {{t "pages.user-account.delete-account.more-information"}}
        <a href="{{this.supportHomeUrl}}" target="_blank" rel="noopener noreferrer">
          {{t "pages.user-account.delete-account.more-information-contact-support"}}
        </a>
      </p>

      <PixButton @triggerAction={{this.openModal}} @variant="error">
        {{t "pages.user-account.delete-account.actions.delete"}}
      </PixButton>

      <PixModal
        class="delete-account-modal"
        @title={{t "pages.user-account.delete-account.modal.title"}}
        @showModal={{this.modalOpen}}
        @onCloseButtonClick={{this.closeModal}}
      >
        <:content>
          <p>{{t "pages.user-account.delete-account.modal.question"}}</p>
          {{#if this.hasEmail}}
            <p>
              <strong>{{@user.email}}</strong>
            </p>
          {{else}}
            <p>
              <strong>
                {{@user.firstName}}
                {{@user.lastName}}
              </strong>
            </p>
          {{/if}}
          <p>{{t "pages.user-account.delete-account.modal.warning-1"}}</p>
          <p>{{t "pages.user-account.delete-account.modal.warning-2"}}</p>

          {{#if this.globalError}}
            <PixNotificationAlert @type="error" @withIcon={{true}} role="alert" class="delete-account-modal__error">
              {{t this.globalError}}
            </PixNotificationAlert>
          {{/if}}
        </:content>

        <:footer>
          <ul class="delete-account-modal__footer">
            <li>
              <PixButton @variant="secondary" @isBorderVisible={{true}} @triggerAction={{this.closeModal}}>
                {{t "common.actions.cancel"}}
              </PixButton>
            </li>
            <li>
              <PixButton
                @variant="error"
                @triggerAction={{this.selfDeleteUserAccount}}
                @isLoading={{this.isLoading}}
              >{{t "pages.user-account.delete-account.actions.delete"}}</PixButton>
            </li>
          </ul>
        </:footer>
      </PixModal>
    </section>
  </template>
}
