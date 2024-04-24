import { action } from '@ember/object';
import { service } from '@ember/service';

import ChallengeItemGeneric from './challenge-item-generic';

export default class ChallengeItemQcm extends ChallengeItemGeneric {
  @service intl;
  checkedValues = new Set();

  _hasError() {
    return this.checkedValues.size < 2;
  }

  _getAnswerValue() {
    return Array.from(this.checkedValues).join(',');
  }

  _getErrorMessage() {
    return this.intl.t('pages.challenge.skip-error-message.qcm');
  }

  @action
  answerChanged(checkboxName) {
    if (this.checkedValues.has(checkboxName)) {
      this.checkedValues.delete(checkboxName);
    } else {
      this.checkedValues.add(checkboxName);
    }
    this.errorMessage = null;
  }
}
