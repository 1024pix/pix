import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ChallengeItemGeneric from './challenge-item-generic';
import { inject as service } from '@ember/service';

export default class ChallengeItemQroc extends ChallengeItemGeneric {
  @service intl;

  @tracked autoReplyAnswer = '';
  postMessageHandler = null;

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
    if (typeof event.data === 'string') {
      this.autoReplyAnswer = event.data;
    }
  }

  get showProposal() {
    return !this.args.challenge.autoReply;
  }

  @action
  answerChanged() {
    this.errorMessage =  null;
  }

  removeEventListener() {
    this.cancelTimer();
    window.removeEventListener('message', this.postMessageHandler);
  }

}

