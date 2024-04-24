import { action } from '@ember/object';
import { service } from '@ember/service';

import ChallengeItemGeneric from './challenge-item-generic';

export default class ChallengeItemQcu extends ChallengeItemGeneric {
  @service intl;

  _hasError() {
    return this._getAnswerValue().length < 1;
  }

  _getAnswerValue() {
    const checkedInputValues = [];
    const radioInputElements = document.querySelectorAll('input[type="radio"]:checked');
    Array.prototype.forEach.call(radioInputElements, function (element) {
      checkedInputValues.push(element.getAttribute('data-value'));
    });
    return checkedInputValues.join('');
  }

  _getErrorMessage() {
    return this.intl.t('pages.challenge.skip-error-message.qcu');
  }

  @action
  answerChanged() {
    this.errorMessage = null;
  }
}
