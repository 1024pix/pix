import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import ChallengeActions from 'mon-pix/components/challenge-actions';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';
import TimeoutGauge from 'mon-pix/components/timeout-gauge';
import getQrocInputSize from 'mon-pix/helpers/get-qroc-input-size';
import { isEmbedAllowedOrigin } from 'mon-pix/utils/embed-allowed-origins';
import generateRandomString from 'mon-pix/utils/generate-random-string';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

import ChallengeItemGeneric from './challenge-item-generic';

export default class ChallengeItemQroc extends ChallengeItemGeneric {
  <template>
    <form {{on "submit" this.validateAnswer}}>
      {{#if this.showProposal}}
        <div class="rounded-panel__row challenge-response {{if @answer 'challenge-response--locked'}}">
          <h2 class="sr-only">{{t "pages.challenge.parts.answer-input"}}</h2>
          <div class="challenge-proposals qroc-proposal">
            {{#each this._blocks as |block|}}
              {{#if block.text}}
                <label for="qroc_input">
                  <MarkdownToHtml @isInline={{true}} @extensions="remove-paragraph-tags" @markdown={{block.text}} />
                </label>
              {{/if}}

              {{#if block.input}}
                {{#if (eq block.type "select")}}
                  <div class="challenge-response__proposal challenge-response__proposal--selector">
                    <PixSelect
                      @id="qroc_input"
                      data-uid="qroc-proposal-uid"
                      data-test="challenge-response-proposal-selector"
                      @isDisabled={{this.isAnswerFieldDisabled}}
                      @label={{block.ariaLabel}}
                      @screenReaderOnly={{true}}
                      @placeholder={{block.placeholder}}
                      @value={{this.qrocProposalAnswerValue}}
                      @hideDefaultOption={{true}}
                      @options={{block.options}}
                      @onChange={{this.onChangeSelect}}
                      @size="large"
                    />
                  </div>
                {{else if (eq @challenge.format "paragraphe")}}
                  <div class="challenge-response__proposal challenge-response__proposal--paragraph">
                    <PixTextarea
                      @id="qroc_input"
                      rows="5"
                      placeholder={{block.placeholder}}
                      name={{block.randomName}}
                      @value={{this.userAnswer}}
                      data-test="challenge-response-proposal-selector"
                      data-uid="qroc-proposal-uid"
                      disabled={{this.isAnswerFieldDisabled}}
                      autocomplete="nope"
                      {{on "keyup" this.answerChanged}}
                    />
                  </div>
                {{else if (eq @challenge.format "phrase")}}
                  <div class="challenge-response__proposal challenge-response__proposal--sentence">
                    <PixInput
                      @id="qroc_input"
                      name={{block.randomName}}
                      type="text"
                      placeholder={{block.placeholder}}
                      {{on "keyup" this.answerChanged}}
                      autocomplete="nope"
                      @value={{this.userAnswer}}
                      disabled={{this.isAnswerFieldDisabled}}
                      data-uid="qroc-proposal-uid"
                      data-test="challenge-response-proposal-selector"
                    />
                  </div>
                {{else if (eq @challenge.format "nombre")}}
                  <PixInput
                    @id="qroc_input"
                    name={{block.randomName}}
                    type="number"
                    step="any"
                    min="0"
                    data-test="challenge-response-proposal-selector"
                    placeholder={{block.placeholder}}
                    @value={{this.userAnswer}}
                    data-uid="qroc-proposal-uid"
                    disabled={{this.isAnswerFieldDisabled}}
                    {{on "keyup" this.answerChanged}}
                  />

                {{else}}
                  <PixInput
                    class="challenge-response__proposal"
                    @id="qroc_input"
                    name={{block.randomName}}
                    size="{{getQrocInputSize @challenge.format}}"
                    type="text"
                    data-test="challenge-response-proposal-selector"
                    placeholder={{block.placeholder}}
                    @value={{this.userAnswer}}
                    autocomplete="nope"
                    data-uid="qroc-proposal-uid"
                    disabled={{this.isAnswerFieldDisabled}}
                    {{on "keyup" this.answerChanged}}
                  />
                {{/if}}
              {{/if}}

              {{#if block.breakline}}
                <br />
              {{/if}}

            {{/each}}
          </div>

          {{#if @answer}}
            <div class="challenge-response__locked-overlay">
              <PixIcon @name="lock" @plainIcon={{true}} @ariaHidden={{true}} class="challenge-response-locked__icon" />
            </div>
          {{/if}}

          {{#if this.displayTimer}}
            <div class="timeout-gauge-wrapper">
              <TimeoutGauge
                @allottedTime={{@challenge.timer}}
                @hasTimeoutChallenge={{@assessment.hasTimeoutChallenge}}
                @setChallengeAsTimedOut={{this.setChallengeAsTimedOut}}
              />
            </div>
          {{/if}}
        </div>
      {{/if}}

      {{#if this.errorMessage}}
        <PixNotificationAlert role="alert" class="challenge-response__alert" @type="error" @withIcon={{true}}>
          {{this.errorMessage}}
        </PixNotificationAlert>
      {{/if}}

      {{#if @assessment}}
        <ChallengeActions
          @challenge={{@challenge}}
          @answer={{@answer}}
          @isValidateActionLoading={{this.isValidateActionLoading}}
          @isSkipActionLoading={{this.isSkipActionLoading}}
          @isCertification={{@assessment.isCertification}}
          @resumeAssessment={{this.resumeAssessment}}
          @isDisabled={{this.isAnswerFieldDisabled}}
          @validateAnswer={{this.validateAnswer}}
          @skipChallenge={{this.skipChallenge}}
          @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
          @hasFocusedOutOfWindow={{@hasFocusedOutOfWindow}}
          @hasOngoingChallengeLiveAlert={{@assessment.hasOngoingChallengeLiveAlert}}
          @hasOngoingCompanionLiveAlert={{@assessment.hasOngoingCompanionLiveAlert}}
          @certificationVersion={{@assessment.certificationCourse.version}}
          @isAdjustedCourseForAccessibility={{@assessment.certificationCourse.isAdjustedForAccessibility}}
        />
      {{/if}}
    </form>
  </template>
  @service intl;

  @tracked autoReplyAnswer = '';
  @tracked autoReplyErrorMessage = '';
  @tracked qrocProposalAnswerValue = '';
  postMessageHandler = null;

  constructor() {
    super(...arguments);
    this.qrocProposalAnswerValue = this.userAnswer;
    if (this.args.challenge.autoReply) {
      this._addEventListener();
    }
  }

  _hasError() {
    if (this._getAnswerValue().length < 1) {
      return true;
    } else if (this.args.challenge.format === 'nombre') {
      return this._getAnswerValue() < 0;
    }
    return false;
  }

  _getAnswerValue() {
    const qrocProposalAnswerValueBis =
      document.querySelector('[data-uid="qroc-proposal-uid"]')?.value || this.qrocProposalAnswerValue;
    return this.showProposal ? qrocProposalAnswerValueBis : this.autoReplyAnswer;
  }

  _getErrorMessage() {
    if (this.autoReplyErrorMessage) return this.autoReplyErrorMessage;
    if (this.args.challenge.autoReply) return this.intl.t('pages.challenge.skip-error-message.qroc-auto-reply');
    if (this.args.challenge.format === 'nombre')
      return this.intl.t('pages.challenge.skip-error-message.qroc-positive-number');
    return this.intl.t('pages.challenge.skip-error-message.qroc');
  }

  _addEventListener() {
    this.postMessageHandler = this._receiveEmbedMessage.bind(this);
    window.addEventListener('message', this.postMessageHandler);
  }

  _receiveEmbedMessage(event) {
    const message = this._getMessageFromEventData(event);
    if (message == null || message.from !== 'pix') return;

    if (message.validity != null) this.autoReplyErrorMessage = message.validity;

    if (message.answer == null) return;
    this.autoReplyAnswer = message.answer;
  }

  _getMessageFromEventData(event) {
    if (!isEmbedAllowedOrigin(event.origin)) return null;

    if (this._isNumeric(event.data)) {
      return this._transformToObjectMessage(event.data);
    }

    if (typeof event.data === 'string') {
      try {
        return JSON.parse(event.data);
      } catch {
        return this._transformToObjectMessage(event.data);
      }
    }

    if (typeof event.data === 'object') {
      if (event.data.type && event.data.type !== 'answer') return null;
      return event.data;
    }

    return null;
  }

  _isNumeric(x) {
    return parseFloat(x).toString() === x;
  }

  _transformToObjectMessage(answer) {
    return { answer: answer, from: 'pix' };
  }

  get showProposal() {
    return !this.args.challenge.autoReply;
  }

  @action
  answerChanged() {
    this.errorMessage = null;
  }

  @action
  onChangeSelect(value) {
    this.errorMessage = null;
    this.qrocProposalAnswerValue = value;
  }

  get _blocks() {
    return proposalsAsBlocks(this.args.challenge.proposals).map((block) => {
      block.randomName = generateRandomString(block.input);
      block.ariaLabel = block.autoAriaLabel
        ? this.intl.t('pages.challenge.answer-input.numbered-label', { number: block.ariaLabel })
        : block.ariaLabel;
      return block;
    });
  }

  get userAnswer() {
    const answer = this.args.answer?.value ?? this._defaultAnswer;
    return _wasSkipped(answer) ? '' : answer;
  }

  get _defaultAnswer() {
    const inputBlock = this._blocks.find((block) => block.input != null);
    return inputBlock?.defaultValue ?? '';
  }
  willDestroy() {
    super.willDestroy(...arguments);
    window.removeEventListener('message', this.postMessageHandler);
  }
}

function _wasSkipped(answer) {
  if (typeof answer !== 'string') return false;
  return answer.includes('#ABAND#');
}
