import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ChallengeItemGeneric from './challenge-item-generic';
import { inject as service } from '@ember/service';
import generateRandomString from 'mon-pix/utils/generate-random-string';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';
import ENV from 'mon-pix/config/environment';

export default class ChallengeItemQroc extends ChallengeItemGeneric {
  @service intl;

  @tracked autoReplyAnswer = '';
  @tracked qcrocProposalAnswerValue = '';
  postMessageHandler = null;
  embedOrigins = ENV.APP.EMBED_ALLOWED_ORIGINS;

  constructor() {
    super(...arguments);
    this.qcrocProposalAnswerValue = this.userAnswer;
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
    const qcrocProposalAnswerValueBis =
      document.querySelector('[data-uid="qroc-proposal-uid"]')?.value || this.qcrocProposalAnswerValue;
    return this.showProposal ? qcrocProposalAnswerValueBis : this.autoReplyAnswer;
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
    let data = null;
    const isAllowedOrigin = this.allowedOriginWithRegExp.some((allowedOrigin) => {
      return event.origin.match(allowedOrigin);
    });
    if (isAllowedOrigin) {
      if (this._isNumeric(event.data)) {
        data = this._transformToObjectMessage(event.data);
      } else if (typeof event.data === 'string') {
        try {
          data = JSON.parse(event.data);
        } catch {
          data = this._transformToObjectMessage(event.data);
        }
      } else if (typeof event.data === 'object') {
        data = event.data;
      }
    }
    return data;
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
    this.qcrocProposalAnswerValue = value;
  }

  @action
  removeEmbedAutoEventListener() {
    window.removeEventListener('message', this.postMessageHandler);
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
    return answer.indexOf('#ABAND#') > -1 ? '' : answer;
  }

  get _defaultAnswer() {
    const inputBlock = this._blocks.find((block) => block.input != null);
    return inputBlock?.defaultValue ?? '';
  }

  get allowedOriginWithRegExp() {
    return this.embedOrigins.map((allowedOrigin) => {
      return new RegExp(allowedOrigin.replace('*', '[\\w-]+'));
    });
  }
}
