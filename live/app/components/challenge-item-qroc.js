import Ember from 'ember';
import _ from 'lodash/lodash';
import ChallengeItemGeneric from './challenge-item-generic';

const ChallengeItemQroc = ChallengeItemGeneric.extend({

  _hasError: function () {
    const values = _.values(this.get('answers'));
    return (Ember.isEmpty(values) || values.length < 1 || values.every(Ember.isBlank));
  },

  _getAnswerValue() {
    const answers = this.get('answers');
    return _.pairs(answers).map(([key, value]) => `${key} = "${value}"`).join(', ');
  },

  _getErrorMessage() {
    return 'Pour valider, saisir une réponse. Sinon, passer.';
  },

  actions: {

    updateQrocAnswer(event) {

      const { name, value } = event.currentTarget;
      this.set(`answers.${name}`, value);
      this.set('errorMessage', null);
    }
  }

});

export default ChallengeItemQroc;
