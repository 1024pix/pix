import ChallengeItemGeneric from './challenge-item-generic';

const ChallengeItemQcu = ChallengeItemGeneric.extend({

  _hasError: function () {
    return this._getAnswerValue().length < 1;
  },

  // XXX : data is extracted from DOM of child component, breaking child encapsulation.
  // This is not "the Ember way", however it makes code easier to read,
  // and moreover, it is a much more robust solution when you need to test it properly.
  _getAnswerValue() {
    return this.$('.challenge-proposals input:radio:checked').map(function () {
      return this.name;
    }).get().join('');
  },

  _getErrorMessage() {
    return 'Pour valider, sélectionner une réponse. Sinon, passer.';
  },

  actions: {
    answerChanged: function () {
      this.set('errorMessage', null);
    }
  }

});

export default ChallengeItemQcu;
