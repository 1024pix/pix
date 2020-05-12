import { action } from '@ember/object';
import _ from 'lodash';
import classic from 'ember-classic-decorator';

import ChallengeItemGeneric from './challenge-item-generic';
import jsyaml from 'js-yaml';

@classic
class ChallengeItemQrocm extends ChallengeItemGeneric {
  _hasError() {
    const allAnswers = this._getRawAnswerValue(); // ex. {"logiciel1":"word", "logiciel2":"excel", "logiciel3":""}
    return this._hasEmptyAnswerFields(allAnswers);
  }

  _hasEmptyAnswerFields(answers) {
    return _.filter(answers, _.isEmpty).length;
  }

  _getAnswerValue() {
    return jsyaml.safeDump(this._getRawAnswerValue());
  }

  // XXX : data is extracted from DOM of child component, breaking child encapsulation.
  // This is not "the Ember way", however it makes code easier to read,
  // and moreover, is a much more robust solution when you need to test it properly.
  _getRawAnswerValue() {
    const result = {};
    // XXX : forEach on NodeList returned by document.querySelectorAll is not supported by IE
    _.forEach(document.querySelectorAll('.challenge-proposals input'), (element) => {
      result[element.getAttribute('name')] = element.value;
    });
    return result;
  }

  _getErrorMessage() {
    return 'Pour valider, veuillez remplir tous les champs réponse. Sinon, passer.';
  }

  @action
  answerChanged() {
    this.set('errorMessage', null);
  }
}

export default ChallengeItemQrocm;
