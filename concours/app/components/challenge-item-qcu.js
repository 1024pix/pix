import { action } from '@ember/object';
import ChallengeItemGeneric from './challenge-item-generic';
import classic from 'ember-classic-decorator';

@classic
class ChallengeItemQcu extends ChallengeItemGeneric {
  _hasError() {
    return this._getAnswerValue().length < 1;
  }

  // FIXME refactor this
  _getAnswerValue() {

    return this.$('.challenge-proposals input:radio:checked').map(function() {
      return this.getAttribute('data-value');
    }).get().join('');
  }

  _getErrorMessage() {
    return 'Pour valider, sélectionner une réponse. Sinon, passer.';
  }

  @action
  answerChanged() {
    this.set('errorMessage', null);
  }
}

export default ChallengeItemQcu;
