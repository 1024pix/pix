import Ember from 'ember';
import _ from 'lodash/lodash';
import ChallengeItemGeneric from './challenge-item-generic';



const ChallengeItemQcu = ChallengeItemGeneric.extend({

  selectedProposal: null,

  onSelectedProposalChanged: Ember.observer('selectedProposal', function () {
    this.set('errorMessage', null);
  }),

  _hasError: function () {
    return Ember.isEmpty(this.get('selectedProposal'));
  },

  _getAnswerValue() {
    const selectedValue = this.get('selectedProposal');
    return `${selectedValue + 1}`;
  },

  _getErrorMessage() {
    return "Pour valider, sélectionner une réponse. Sinon, passer.";
  },

  actions: {


  }

});

export default ChallengeItemQcu;
