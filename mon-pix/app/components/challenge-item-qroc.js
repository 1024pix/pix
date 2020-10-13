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
  _getCorrectFormatValue(answerValue) {
    if (this.args.challenge.format === 'date') {
      const dateArray = answerValue.split('-');
      return dateArray.length === 3 ? dateArray[2] + '/' + dateArray[1] + '/' + dateArray[0] : answerValue;
    }
    return answerValue;
  }

  _getAnswerValue() {
    if (this.showProposal) {
      const answerValue = (document.querySelector('[data-uid="qroc-proposal-uid"]')).value;
      return this._getCorrectFormatValue(answerValue);
    }
    return this.autoReplyAnswer;

  }

  _getErrorMessage() {
    const errorMessage = this.args.challenge.autoReply ? 'pages.challenge.skip-error-message.qroc-auto-reply' : 'pages.challenge.skip-error-message.qroc';
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

