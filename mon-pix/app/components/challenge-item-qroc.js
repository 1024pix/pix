import { action } from '@ember/object';
import ChallengeItemGeneric from './challenge-item-generic';
import classic from 'ember-classic-decorator';

@classic
class ChallengeItemQroc extends ChallengeItemGeneric {

  autoReplyAnswer = '';

  _hasError() {
    return this._getAnswerValue().length < 1;
  }

  _getAnswerValue() {
    return this.showProposal ? (document.querySelector('[data-uid="qroc-proposal-uid"]')).value : this.autoReplyAnswer;
  }

  _getErrorMessage() {
    return 'Jouer l\'épreuve pour valider. Sinon, passer.';
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
    return !this.challenge.autoReply;
  }

  @action
  answerChanged() {
    this.set('errorMessage', null);
  }

  didInsertElement() {
    if (this.challenge.autoReply) {
      this._addEventListener();
    }
  }

  didDestroyElement() {
    if (this.challenge.autoReply) {
      window.removeEventListener('message', this.postMessageHandler);
    }
  }

}

export default ChallengeItemQroc;
