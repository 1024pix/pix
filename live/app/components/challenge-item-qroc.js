import ChallengeItemGeneric from './challenge-item-generic';

const ChallengeItemQroc = ChallengeItemGeneric.extend({

  _hasError: function() {
    return this._getAnswerValue().length < 1;
  },

  // XXX : data is extracted from DOM of child component, breaking child encapsulation.
  // This is not "the Ember way", however it makes code easier to read,
  // and moreover, it is a much more robust solution when you need to test it properly.
  _getAnswerValue() {
    return this.$('input[data-uid="qroc-proposal-uid"]').val();
  },

  _getErrorMessage() {
    return 'Pour valider, saisir une réponse. Sinon, passer.';
  },

  actions: {
    inputChanged() {
      this.set('errorMessage', null);
    }
  }

});

export default ChallengeItemQroc;
