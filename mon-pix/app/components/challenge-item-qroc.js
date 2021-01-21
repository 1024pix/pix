import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ChallengeItemGeneric from './challenge-item-generic';
import { inject as service } from '@ember/service';

export default class ChallengeItemQroc extends ChallengeItemGeneric {
  @service intl;

  @tracked autoReplyAnswer = '';
  postMessageHandler = null;
  embedOrigin = 'https://epreuves.pix.fr';

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
    if (event.origin === this.embedOrigin) {
      if (typeof event.data === 'string') {
        try {
          data = JSON.parse(event.data);
        } catch {
          data = { answer: event.data, from: 'pix' };
        }
      } else if (typeof event.data === 'object') {
        data = event.data;
      }
    }
    return data;
  }

  get showProposal() {
    return !this.args.challenge.autoReply;
  }

  @action
  answerChanged() {
    this.errorMessage = null;
  }

  removeEventListener() {
    this.cancelTimer();
    window.removeEventListener('message', this.postMessageHandler);
  }

}

