import { PixIcon, PixInput, PixNotificationAlert, PixSelect, PixTextarea } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';
import getQrocInputSize from 'mon-pix/helpers/get-qroc-input-size';
import { isEmbedAllowedOrigin } from 'mon-pix/utils/embed-allowed-origins';
import generateRandomString from 'mon-pix/utils/generate-random-string';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default class ChallengeItemQroc extends Component {
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
    } else if (this.qrocProposalAnswerValue) {
      this._notifyAnswerChange();
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

  get errorMessage() {
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
    this._notifyAnswerChange();
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

  _notifyAnswerChange() {
    this.args.setAnswerValue?.(this._getAnswerValue());
    this.args.setAnswerError?.(this._hasError());
  }

  @action
  answerChanged() {
    this._notifyAnswerChange();
  }

  @action
  onChangeSelect(value) {
    this.qrocProposalAnswerValue = value;
    this._notifyAnswerChange();
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
  <template>
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
                    @isDisabled={{@isAnswerFieldDisabled}}
                    @screenReaderOnly={{true}}
                    @texts={{hash placeholder=block.placeholder}}
                    @value={{this.qrocProposalAnswerValue}}
                    @hideDefaultOption={{true}}
                    @options={{block.options}}
                    @onChange={{this.onChangeSelect}}
                    @size="large"
                  >
                    <:label>{{block.ariaLabel}}</:label>
                  </PixSelect>
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
                    disabled={{@isAnswerFieldDisabled}}
                    autocomplete="nope"
                    {{on "input" this.answerChanged}}
                  />
                </div>
              {{else if (eq @challenge.format "phrase")}}
                <div class="challenge-response__proposal challenge-response__proposal--sentence">
                  <PixInput
                    @id="qroc_input"
                    name={{block.randomName}}
                    type="text"
                    placeholder={{block.placeholder}}
                    {{on "input" this.answerChanged}}
                    autocomplete="nope"
                    @value={{this.userAnswer}}
                    disabled={{@isAnswerFieldDisabled}}
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
                  disabled={{@isAnswerFieldDisabled}}
                  {{on "input" this.answerChanged}}
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
                  disabled={{@isAnswerFieldDisabled}}
                  {{on "input" this.answerChanged}}
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

        {{yield to="timeGauge"}}
      </div>
    {{/if}}
    {{#if @displayErrorMessage}}
      <PixNotificationAlert role="alert" class="challenge-response__alert" @type="error" @withIcon={{true}}>
        {{this.errorMessage}}
      </PixNotificationAlert>
    {{/if}}
  </template>
}

function _wasSkipped(answer) {
  if (typeof answer !== 'string') return false;
  return answer.includes('#ABAND#');
}
