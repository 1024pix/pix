import ChallengeItemGeneric from './challenge-item-generic';

const ChallengeItemQcm = ChallengeItemGeneric.extend({

  _hasError: function() {
    return this._getAnswerValue().length < 1;
  },

  // FIXME refactor that
  _getAnswerValue() {
    return this.$('input[type=checkbox][id^=checkbox_]:checked').map(function() {return this.name; }).get().join(',');
  },

  _getErrorMessage() {
    return 'Pour valider, sélectionner au moins une réponse. Sinon, passer.';
  },

  actions: {
    answerChanged: function() {
      this.set('errorMessage', null);
    }
  }

});

export default ChallengeItemQcm;
