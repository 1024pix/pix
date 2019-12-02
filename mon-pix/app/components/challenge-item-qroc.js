import ChallengeItemGeneric from './challenge-item-generic';

const ChallengeItemQroc = ChallengeItemGeneric.extend({

  _hasError: function() {
    return this._getAnswerValue().length < 1;
  },

  // FIXME refactor that
  _getAnswerValue() {
    return (this.$('[data-uid="qroc-proposal-uid"]')).val();
  },

  _getErrorMessage() {
    return 'Pour valider, saisir une réponse. Sinon, passer.';
  },

  actions: {
    answerChanged() {
      this.set('errorMessage', null);
    }
  }

});

export default ChallengeItemQroc;
