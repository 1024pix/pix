/* global jsyaml */
import _ from 'pix-live/utils/lodash-custom';

import ChallengeItemGeneric from './challenge-item-generic';

const ChallengeItemQrocm = ChallengeItemGeneric.extend({

  _hasError: function () {
    const allAnswers = this._getRawAnswerValue(); // ex. {"logiciel1":"word", "logiciel2":"excel", "logiciel3":""}
    const hasAtLeastOneAnswer = _(allAnswers).hasSomeTruthyProps();
    return _.isFalsy(hasAtLeastOneAnswer);
  },

  _getAnswerValue() {
    return jsyaml.safeDump(this._getRawAnswerValue());
  },

  // XXX : data is extracted from DOM of child component, breaking child encapsulation.
  // This is not "the Ember way", however it makes code easier to read,
  // and moreover, is a much more robust solution when you need to test it properly.
  _getRawAnswerValue() {
    const result = {};
    $('.challenge-proposals input').each(function (index, element) {
      result[$(element).attr('name')] = $(element).val();
    });
    return result;
  },

  _getErrorMessage() {
    return 'Pour valider, saisir au moins une réponse. Sinon, passer.';
  },

  actions: {
    inputChanged() {
      this.set('errorMessage', null);
    }
  }

});

export default ChallengeItemQrocm;
