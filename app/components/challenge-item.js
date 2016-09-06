import Ember from 'ember';

const ChallengeItem = Ember.Component.extend({

  tagName: 'article',
  classNames: ['challenge-item'],
  attributeBindings: ['challenge.id:data-challenge-id'],

  assessmentService: Ember.inject.service('assessment'),

  challenge: null,
  assessment: null,
  selectedProposal: null,
  error: null,

  hasIllustration: Ember.computed.notEmpty('challenge.illustrationUrl'),
  isChallengePreviewMode: Ember.computed.empty('assessment'),
  hasError: Ember.computed.notEmpty('error'),

  challengeIsTypeQROC: Ember.computed.equal('challenge.type', 'QROC'),
  challengeIsTypeQCM: Ember.computed.equal('challenge.type', 'QCM'),
  challengeIsTypeQCU: Ember.computed.equal('challenge.type', 'QCU'),

  onSelectedProposalChanged: Ember.observer('selectedProposal', function () {
    this.set('error', null);
  }),

  didUpdateAttrs() {
    this._super(...arguments);
    this.set('selectedProposal', null);
  },

  actions: {
    validate(challenge, assessment) {
      if (Ember.isEmpty(this.get('selectedProposal'))) {
        this.set('error', 'Vous devez sélectionner une réponse.');
        return;
      }
      const value = this._adaptSelectedProposalValueToBackendValue(this.get('selectedProposal'));
      this.sendAction('onValidated', challenge, assessment, value);
    }
  },

  _adaptSelectedProposalValueToBackendValue(value) {
    return `${value + 1}`;
  }
});

ChallengeItem.reopenClass({
  positionalParams: ['challenge', 'assessment']
});

export default ChallengeItem;
