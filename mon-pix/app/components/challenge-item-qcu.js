import ChallengeItemGeneric from './challenge-item-generic';

const ChallengeItemQcu = ChallengeItemGeneric.extend({

  _hasError: function() {
    return this._getAnswerValue().length < 1;
  },

  // FIXME refactor this
  _getAnswerValue() {

    return this.$('.challenge-proposals input:radio:checked').map(function() {
      return this.getAttribute('data-value');
    }).get().join('');
  },

  _getErrorMessage() {
    return 'Pour valider, sélectionner une réponse. Sinon, passer.';
  },

  actions: {
    answerChanged: function() {
      this.set('errorMessage', null);
    }
  }

});

export default ChallengeItemQcu;
