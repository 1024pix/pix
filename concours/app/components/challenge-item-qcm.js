import { action } from '@ember/object';
import ChallengeItemGeneric from './challenge-item-generic';
import classic from 'ember-classic-decorator';

@classic
class ChallengeItemQcm extends ChallengeItemGeneric {
  _hasError() {
    return this._getAnswerValue().length < 1;
  }

  // FIXME refactor that
  _getAnswerValue() {
    return this.$('input[type=checkbox][id^=checkbox_]:checked').map(function() {return this.name; }).get().join(',');
  }

  _getErrorMessage() {
    return 'Pour valider, sélectionner au moins une réponse. Sinon, passer.';
  }

  @action
  answerChanged() {
    this.set('errorMessage', null);
  }
}

export default ChallengeItemQcm;
