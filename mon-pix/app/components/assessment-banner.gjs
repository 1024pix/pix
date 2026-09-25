import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

export default class AssessmentBanner extends Component {
  @service intl;
  @service featureToggles;
  @service currentUser;
  @service store;
  @service router;

  @tracked showClosingModal = false;
  @tracked campaign = null;
  @tracked campaignParticipation = null;

  constructor(...args) {
    super(...args);
    this.args?.assessment?.campaign.then(async (campaign) => {
      this.campaign = campaign;
      if (this.campaign?.customResultPageButtonUrl && !this.isRedirectionUrlInternal) {
        this.campaignParticipation = await this.store.queryRecord('campaign-participation', {
          campaignId: campaign.id,
          userId: this.currentUser.user.id,
        });
      }
    });
  }

  get isRedirectionUrlInternal() {
    if (this.campaign.customResultPageButtonUrl.startsWith('http')) {
      return false;
    }
    try {
      this.router.recognize(this.campaign.customResultPageButtonUrl);
      return true;
    } catch {
      return false;
    }
  }

  get redirectionUrl() {
    if (!this.campaign || !this.campaign.customResultPageButtonUrl) return null;

    if (this.isRedirectionUrlInternal) {
      return this.campaign.customResultPageButtonUrl;
    } else {
      const params = {};

      params.externalId = this.campaignParticipation?.participantExternalId ?? undefined;

      return buildUrl(this.campaign.customResultPageButtonUrl, params);
    }
  }

  get title() {
    return this.args?.assessment?.title;
  }

  get textToSpeechTooltipText() {
    return this.args.isTextToSpeechActivated
      ? this.intl.t('pages.challenge.statement.text-to-speech.deactivate')
      : this.intl.t('pages.challenge.statement.text-to-speech.activate');
  }

  get showTextToSpeechActivationButton() {
    return (
      this.featureToggles.featureToggles?.isTextToSpeechButtonEnabled &&
      this.args.displayTextToSpeechActivationButton &&
      window.speechSynthesis
    );
  }

  @action
  toggleClosingModal() {
    this.showClosingModal = !this.showClosingModal;
  }

  <template>
    <div class="assessment-banner">
      <header class="assessment-banner-container" role="banner">
        <img class="assessment-banner__pix-logo" src="/images/pix-logo-blanc.svg" alt="{{t 'common.pix'}}" />
        {{#if this.title}}
          <div class="assessment-banner__splitter"></div>
          <h1 class="assessment-banner__title">
            <span class="sr-only"> {{t "pages.assessment-banner.title"}} </span>
            {{this.title}}
          </h1>
        {{/if}}
        <div class="assessment-banner__actions">
          {{#if this.showTextToSpeechActivationButton}}
            <PixTooltip class="assessment-banner__text-to-speech-toggle" @position="left" @isInline={{true}}>
              <:triggerElement>
                <button type="button" aria-label={{this.textToSpeechTooltipText}} {{on "click" @toggleTextToSpeech}}>
                  <PixIcon @name={{if @isTextToSpeechActivated "volumeOn" "volumeOff"}} />
                </button>
              </:triggerElement>
              <:tooltip>
                {{this.textToSpeechTooltipText}}
              </:tooltip>
            </PixTooltip>
          {{/if}}
          {{#if @displayHomeLink}}
            <button type="button" class="assessment-banner__home-link" onclick={{this.toggleClosingModal}}>
              {{t "common.actions.quit"}}
              <PixIcon @name="logout" @ariaHidden={{true}} />
            </button>
            <PixModal
              class="assessment-banner__closing-modal"
              @title={{t "pages.assessment-banner.modal.title"}}
              @showModal={{this.showClosingModal}}
              @onCloseButtonClick={{this.toggleClosingModal}}
            >
              <:content>
                <p>{{t "pages.assessment-banner.modal.content"}}</p>
              </:content>
              <:footer>
                <ul class="assessment-banner-closing-modal__footer">
                  <li>
                    <PixButton @variant="secondary" @triggerAction={{this.toggleClosingModal}}>
                      {{t "common.actions.stay"}}
                    </PixButton>
                  </li>
                  <li>
                    <ButtonLinkWithHistory
                      @redirectionUrl={{this.redirectionUrl}}
                      @defaultRoute="authenticated"
                      aria-label={{t "pages.assessment-banner.modal.actions.quit.extra-information"}}
                    >
                      {{t "common.actions.quit"}}
                    </ButtonLinkWithHistory>
                  </li>
                </ul>
              </:footer>
            </PixModal>
          {{/if}}
        </div>
      </header>
    </div>
  </template>
}

class ButtonLinkWithHistory extends Component {
  @service router;

  @action
  transitionToRedirectionUrl() {
    this.router.transitionTo(this.args.redirectionUrl);
  }

  get isRedirectionUrlInternal() {
    if (this.args.redirectionUrl.startsWith('http')) {
      return false;
    }
    try {
      return Boolean(this.router.recognize(this.args.redirectionUrl));
    } catch {
      return false;
    }
  }

  <template>
    {{#if @redirectionUrl}}
      {{#if this.isRedirectionUrlInternal}}
        <PixButton @triggerAction={{this.transitionToRedirectionUrl}} ...attributes>
          {{yield}}
        </PixButton>
      {{else}}
        <PixButtonLink @href={{@redirectionUrl}} ...attributes>
          {{yield}}
        </PixButtonLink>
      {{/if}}
    {{else}}
      <PixButtonLink @route={{@defaultRoute}} ...attributes>
        {{yield}}
      </PixButtonLink>
    {{/if}}
  </template>
}

function buildUrl(customUrl, params) {
  const url = new URL(customUrl);
  const urlParams = new URLSearchParams(url.search);

  for (const key in params) {
    if (params[key] !== undefined) {
      urlParams.set(key, params[key]);
    }
  }
  url.search = urlParams.toString();
  return url.toString();
}
