import { action } from '@ember/object';
import ChallengeItemGeneric from './challenge-item-generic';
import _ from 'lodash';

export default class ChallengeItemQcm extends ChallengeItemGeneric {
  answersValue= [];

  _hasError() {
    return this._getAnswerValue().length < 1;
  }

  _getAnswerValue() {
    return this.answersValue.join(',');
  }

  _getErrorMessage() {
    return 'Pour valider, sélectionner au moins une réponse. Sinon, passer.';
  }

  @action
  answerChanged(checkboxName) {
    _.indexOf(this.answersValue, checkboxName) === -1 ? this.answersValue.push(checkboxName) : _.remove(this.answersValue, (value) => value === checkboxName);
    this.set('errorMessage', null);
  }
}
