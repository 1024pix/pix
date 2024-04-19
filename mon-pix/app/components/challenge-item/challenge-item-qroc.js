import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isEmbedAllowedOrigin } from 'mon-pix/utils/embed-allowed-origins';
import generateRandomString from 'mon-pix/utils/generate-random-string';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

import ChallengeItemGeneric from './challenge-item-generic';

export default class ChallengeItemQroc extends ChallengeItemGeneric {
  @service intl;

  @tracked autoReplyAnswer = '';
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
    let errorMessage;
    if (this.args.challenge.autoReply) {
      errorMessage = 'pages.challenge.skip-error-message.qroc-auto-reply';
    } else if (this.args.challenge.format === 'nombre') {
      errorMessage = 'pages.challenge.skip-error-message.qroc-positive-number';
    } else {
      errorMessage = 'pages.challenge.skip-error-message.qroc';
    }
    return this.intl.t(errorMessage);
  }

  _addEventListener() {
    this.postMessageHandler = this._receiveEmbedMessage.bind(this);
    window.addEventListener('message', this.postMessageHandler);
  }

  _receiveEmbedMessage(event) {
    const message = this._getMessageFromEventData(event);
    if (message && message.answer && message.from === 'pix') {
      this.autoReplyAnswer = message.answer;
    }
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

  @action
  removeEmbedAutoEventListener() {
    window.removeEventListener('message', this.postMessageHandler);
  }

  @action
  buildGenericLabel(index, ariaLabel) {
    return ariaLabel || this.intl.t('pages.challenge.answer-input.numbered-label', { number: index + 1 });
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
}

function _wasSkipped(answer) {
  if (typeof answer !== 'string') return false;
  return answer.includes('#ABAND#');
}
