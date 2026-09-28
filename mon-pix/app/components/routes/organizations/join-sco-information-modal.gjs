import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import ENV from 'mon-pix/config/environment';

import { getJoinErrorsMessageByShortCode } from '../../../utils/errors-messages';

const ACCOUNT_WITH_SAMLID_ALREADY_EXISTS_ERRORS = ['R13', 'R33'];

export default class JoinScoInformationModal extends Component {
  <template>
    <PixModal
      @title={{t "pages.join.sco.login-information-title"}}
      @onCloseButtonClick={{@closeModal}}
      @showModal={{true}}
    >
      <:content>
        <div class="join-error-modal__body">
          {{#if this.message}}
            <div class="join-error-modal-body__message" aria-live="polite">
              <p>{{this.message}}</p>
            </div>
          {{/if}}
          {{#if this.isAccountBelongingToAnotherUser}}
            <p>
              {{t "api-error-messages.join-error.r90.account-belonging-to-another-user"}}
              <ul class="join-error-modal-body__list">
                <li>
                  {{t "api-error-messages.join-error.r90.details.if-account-belonging-to-user"}}
                  <a
                    href="{{t 'api-error-messages.join-error.r90.details.contact-support.link-url'}}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{t "api-error-messages.join-error.r90.details.contact-support.link-text"}}
                  </a>
                  {{t "api-error-messages.join-error.r90.details.code"}}
                </li>
                <li>{{t "api-error-messages.join-error.r90.details.disconnect-user"}}</li>
              </ul>
            </p>
          {{/if}}
        </div>
      </:content>
      <:footer>
        <div class="join-error-modal__footer">
          {{#if this.isInformationMode}}
            <PixButton @variant="secondary" @triggerAction={{this.goToHome}}>
              {{t "common.actions.sign-out"}}
            </PixButton>

            <PixButton @triggerAction={{@associate}}>
              {{t "pages.join.sco.associate"}}
            </PixButton>
          {{else}}
            <PixButton
              @variant="{{if this.displayContinueButton 'secondary' 'primary'}}"
              @triggerAction={{this.goToHome}}
            >
              {{t "common.actions.quit"}}
            </PixButton>
            {{#if this.displayContinueButton}}
              <PixButton @triggerAction={{@goToConnectionPage}}>
                {{t "pages.join.sco.continue-with-pix"}}
              </PixButton>
            {{/if}}
          {{/if}}
        </div>
      </:footer>
    </PixModal>
  </template>
  @service session;
  @service router;
  @service url;
  @service intl;

  @tracked message = null;
  @tracked isAccountBelongingToAnotherUser = false;
  @tracked displayContinueButton = true;

  constructor(owner, args) {
    super(owner, args);
    if (this.args.reconciliationWarning) {
      this.isInformationMode = true;
      this.message = this.intl.t('pages.join.sco.login-information-message', {
        ...this.args.reconciliationWarning,
        htmlSafe: true,
      });
    }
    if (this.args.reconciliationError) {
      const error = this.args.reconciliationError;
      this.isInformationMode = false;

      if (error.status === '422') {
        this.displayContinueButton = false;
        this.isAccountBelongingToAnotherUser = true;
      } else {
        this.displayContinueButton = !ACCOUNT_WITH_SAMLID_ALREADY_EXISTS_ERRORS.includes(error.meta.shortCode);
        const defaultMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY);
        this.message =
          this.intl.t(getJoinErrorsMessageByShortCode(error.meta), { value: error.meta.value, htmlSafe: true }) ||
          defaultMessage;
      }
    }
  }

  @action
  async goToHome() {
    await this.session.invalidate();
    return window.location.replace(this.url.homeUrl);
  }
}
