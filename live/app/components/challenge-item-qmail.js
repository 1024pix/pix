import ChallengeItemGeneric from './challenge-item-generic';

export default ChallengeItemGeneric.extend({

  _isChecked: false,

  _hasError: function() {
    return !this.get('_isChecked');
  },

  _getErrorMessage() {
    return 'Pour valider, sélectionner une réponse. Sinon, passer.';
  },

  _getAnswerValue() {
    return '#PENDING#';
  }

});
