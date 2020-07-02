import { action } from '@ember/object';
import ChallengeItemGeneric from './challenge-item-generic';
import classic from 'ember-classic-decorator';

@classic
class ChallengeItemQroc extends ChallengeItemGeneric {
  _hasError() {
    return this._getAnswerValue().length < 1;
  }

  // FIXME refactor that
  _getAnswerValue() {
    return (this.$('[data-uid="qroc-proposal-uid"]')).val();
  }

  _getErrorMessage() {
    return 'Jouer l\'épreuve pour valider. Sinon, passer.';
  }

  get showProposal() {
    return !this.challenge.autoReply;
  }

  @action
  answerChanged() {
    this.set('errorMessage', null);
  }
}

export default ChallengeItemQroc;
