import { PixButton, PixButtonLink, PixIcon, PixModal, PixTooltip } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import { and } from 'ember-truth-helpers';
import startCase from 'lodash/startCase';
import ProgressBar from 'mon-pix/components/ui/assessment/progress-bar';

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
    this.args?.assessment?.campaign?.then(async (campaign) => {
      this.campaign = campaign;
      if (this.campaign?.customResultPageButtonUrl && !this.isRedirectionUrlInternal) {
        this.campaignParticipation = await this.store.queryRecord('campaign-participation', {
          campaignId: campaign.id,
          userId: this.currentUser.user.id,
        });
      }
    });
  }

  get cssClass() {
    const cssClass = ['assessment-banner'];

    if (this.isCertificationContext) cssClass.push('assessment-banner--certification');

    return cssClass.join(' ');
  }

  get isCertificationContext() {
    return !!this.args.certification;
  }

  get candidateFullName() {
    if (!this.isCertificationContext) return '';

    const firstName = this.args.certification.get('firstName');
    const lastName = this.args.certification.get('lastName');
    return `${startCase(firstName)} ${lastName.toUpperCase()}`;
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
    return this.args.certification ? null : this.args?.assessment?.title;
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
    <header class={{this.cssClass}} role="banner">
      <div class="assessment-banner__header">
        <div class="assessment-banner__title">
          <img src="/images/pix-logo-blanc.svg" alt="" />
          {{#if this.title}}
            <span class="assessment-banner__separator" />
            <h1 class="assessment-banner__text">
              <span class="sr-only">{{t "pages.assessment-banner.title"}}</span>
              {{this.title}}
            </h1>
          {{/if}}
        </div>
        {{#if this.isCertificationContext}}
          <h1 class="assessment-banner__title">{{this.candidateFullName}}</h1>

        {{/if}}
        {{#unless this.isCertificationContext}}
          <div class="assessment-banner__action">
            {{#if this.showTextToSpeechActivationButton}}
              <PixTooltip @position="left" @isInline={{true}}>
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
            {{#if (and this.showTextToSpeechActivationButton @displayHomeLink)}}
              <span class="assessment-banner__separator" />
            {{/if}}
            {{#if @displayHomeLink}}
              <PixButton @variant="tertiary" @iconAfter="close" @triggerAction={{this.toggleClosingModal}}>
                {{t "common.actions.quit"}}
              </PixButton>
            {{/if}}
          </div>
        {{/unless}}
      </div>
      {{log @certificationNumber}}
      {{#if this.isCertificationContext}}
        <ProgressBar
          @completionRate={{@completionRate}}
          @assessment={{@assessment}}
          @currentChallengeNumber={{@currentChallengeNumber}}
          @showGlobalProgression={{@showGlobalProgression}}
        >
          <:certificationNumber>
            <div class="certification-number">
              <div class="certification-number__label">{{t
                  "pages.challenge.certification.banner.certification-number"
                }}</div>
              <div class="certification-number__value">{{@certificationNumber}}</div>
            </div>
          </:certificationNumber>
        </ProgressBar>
      {{else}}
        <ProgressBar
          @completionRate={{@completionRate}}
          @assessment={{@assessment}}
          @currentChallengeNumber={{@currentChallengeNumber}}
          @showGlobalProgression={{@showGlobalProgression}}
        />
      {{/if}}

    </header>

    <PixModal
      @title={{t "pages.assessment-banner.modal.title"}}
      @showModal={{this.showClosingModal}}
      @onCloseButtonClick={{this.toggleClosingModal}}
    >
      <:content>
        <p>{{t "pages.assessment-banner.modal.content"}}</p>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{this.toggleClosingModal}}>
          {{t "common.actions.stay"}}
        </PixButton>
        <ButtonLinkWithHistory
          @redirectionUrl={{this.redirectionUrl}}
          @defaultRoute="authenticated"
          aria-label={{t "pages.assessment-banner.modal.actions.quit.extra-information"}}
        >
          {{t "common.actions.quit"}}
        </ButtonLinkWithHistory>
      </:footer>
    </PixModal>
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
