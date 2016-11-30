import Ember from 'ember';
import _ from 'lodash/lodash';
import ChallengeItemGeneric from './challenge-item-generic';

const ChallengeItemQcm = ChallengeItemGeneric.extend({

  _hasError: function () {
    return !(this.get('answers.length') >= 1);
  },

  _getAnswerValue() {
    const answers = this.get('answers');
    return `${answers.map((answer) => parseInt(answer, 10) + 1).join(', ')}`;
  },

  _getErrorMessage() {
    return 'Pour valider, sélectionner au moins une réponse. Sinon, passer.';
  },

  actions: {

    updateQcmAnswer(event) {
      const { name, checked } = event.currentTarget;
      let answers = this.get('answers');

      if (checked) {
        if (Ember.isArray(answers)) {
          answers.push(name);
        }
        else {
          answers = [name];
        }
      }
      else {
        _.remove(answers, (answer) => answer === name);
      }

      this.set('answers', answers);
      this.set('errorMessage', null);
    }

  }

});

export default ChallengeItemQcm;
