import { PixBlock, PixButton, PixCode, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import LocaleSwitcher from './locale-switcher';

export default class CampaignCodeForm extends Component {
  @service intl;
  @service currentUser;
  @service currentDomain;
  @service session;

  @tracked campaignCode = null;
  @tracked apiErrorMessage = null;
  @tracked validationErrorMessage = null;
  @tracked validationStatus = 'default';

  get firstTitle() {
    return this.args.isUserAuthenticatedByPix && !this.currentUser.user.isAnonymous
      ? this.intl.t('pages.fill-in-campaign-code.first-title-connected', { firstName: this.currentUser.user.firstName })
      : this.intl.t('pages.fill-in-campaign-code.first-title-not-connected');
  }

  get showWarningMessage() {
    return this.args.isUserAuthenticatedByPix && !this.currentUser.user.isAnonymous;
  }

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  get isUserNotAuthenticated() {
    return !this.args.isUserAuthenticatedByPix && !this.args.isUserAuthenticatedByGAR;
  }

  get canDisplayLocaleSwitcher() {
    return this.isInternationalDomain && this.isUserNotAuthenticated;
  }

  get warningMessage() {
    return this.intl.t('pages.fill-in-campaign-code.warning-message', {
      firstName: this.currentUser.user.firstName,
      lastName: this.currentUser.user.lastName,
    });
  }

  @action
  clearErrorMessage() {
    this.validationStatus = 'default';
    this.validationErrorMessage = null;
    this.args.clearErrors();
  }

  @action
  handleCampaignCodeInput(event) {
    this.campaignCode = event.target.value;
  }

  @action
  async startCampaign(event) {
    event.preventDefault();
    this.clearErrorMessage();

    if (!this.campaignCode) {
      this.validationStatus = 'error';
      this.validationErrorMessage = this.intl.t('pages.fill-in-campaign-code.errors.missing-code');
      return;
    }

    const campaignCode = this.campaignCode.toUpperCase();
    this.args.startCampaign(campaignCode);
  }

  <template>
    <PixBlock class="fill-in-campaign-code__container">
      <h1 class="fill-in-campaign-code__title">
        {{this.firstTitle}}
      </h1>
      <p id="campaign-code-description" class="fill-in-campaign-code__instruction">{{t
          "pages.fill-in-campaign-code.description"
        }}</p>

      <form class="fill-in-campaign-code__form" autocomplete="off">
        <PixCode
          @id="campaign-code"
          @length="9"
          @requiredLabel={{t "common.form.mandatory"}}
          @screenReaderOnly={{true}}
          @value={{this.certificateVerificationCode}}
          @validationStatus={{this.validationStatus}}
          @errorMessage={{this.validationErrorMessage}}
          aria-describedby="campaign-code-description"
          {{on "keyup" this.clearErrorMessage}}
          {{on "input" this.handleCampaignCodeInput}}
        >
          <:label>{{t "pages.fill-in-campaign-code.label"}}</:label>
        </PixCode>

        {{#if @apiErrorMessage}}
          <PixNotificationAlert @type="error" @withIcon={{true}}>
            {{@apiErrorMessage}}
          </PixNotificationAlert>
        {{/if}}

        <PixButton @type="submit" @triggerAction={{this.startCampaign}}>
          {{t "pages.fill-in-campaign-code.start"}}
        </PixButton>
      </form>

      {{#if this.showWarningMessage}}
        <div class="fill-in-campaign-code__warning">
          <span>{{this.warningMessage}}</span>
          <LinkTo @route="logout" class="link">
            {{t "pages.fill-in-campaign-code.warning-message-logout"}}
          </LinkTo>
        </div>
      {{/if}}
    </PixBlock>

    {{#if this.canDisplayLocaleSwitcher}}
      <LocaleSwitcher />
    {{/if}}
  </template>
}
