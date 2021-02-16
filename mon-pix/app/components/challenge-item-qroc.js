import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ChallengeItemGeneric from './challenge-item-generic';
import { inject as service } from '@ember/service';

export default class ChallengeItemQroc extends ChallengeItemGeneric {
  @service intl;

  @tracked autoReplyAnswer = '';
  postMessageHandler = null;
  embedOrigins = ['https://epreuves.pix.fr', 'https://1024pix.github.io'];

  constructor() {
    super(...arguments);
    if (this.args.challenge.autoReply) {
      this._addEventListener();
    }
  }

  _hasError() {
    return this._getAnswerValue().length < 1;
  }

  _getAnswerValue() {
    return this.showProposal ? (document.querySelector('[data-uid="qroc-proposal-uid"]')).value : this.autoReplyAnswer;
  }

  _getErrorMessage() {
    let errorMessage;
    if (this.args.challenge.autoReply) {
      errorMessage = 'pages.challenge.skip-error-message.qroc-auto-reply';
    }
    else if (this.args.challenge.format === 'nombre') {
      errorMessage = 'pages.challenge.skip-error-message.qroc-number';
    }
    else {
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
    if (this.embedOrigins.includes(event.origin)) {
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

  removeEventListener() {
    window.removeEventListener('message', this.postMessageHandler);
  }

}

