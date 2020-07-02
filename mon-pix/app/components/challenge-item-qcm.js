/* eslint ember/classic-decorator-no-classic-methods: 0 */

import { action } from '@ember/object';
import ChallengeItemGeneric from './challenge-item-generic';

export default class ChallengeItemQcm extends ChallengeItemGeneric {
  checkedValues = new Set();

  _hasError() {
    return this.checkedValues.size < 1;
  }

  _getAnswerValue() {
    return Array.from(this.checkedValues).join(',');
  }

  _getErrorMessage() {
    return 'Pour valider, sélectionner au moins une réponse. Sinon, passer.';
  }

  @action
  answerChanged(checkboxName) {
    if (this.checkedValues.has(checkboxName)) {
      this.checkedValues.delete(checkboxName);
    } else {
      this.checkedValues.add(checkboxName);
    }
    this.set('errorMessage', null);
  }
}
