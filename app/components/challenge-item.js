import Ember from 'ember';
import _ from 'lodash/lodash';

const { computed, inject } = Ember;

const ChallengeItem = Ember.Component.extend({

  tagName: 'article',
  classNames: ['challenge-item'],
  attributeBindings: ['challenge.id:data-challenge-id'],

  assessmentService: inject.service('assessment'),

  challenge: null,
  assessment: null,
  selectedProposal: null,
  errorMessage: null,
  answers: {},

  hasIllustration: computed.notEmpty('challenge.illustrationUrl'),
  isChallengePreviewMode: computed.empty('assessment'),
  hasError: computed.notEmpty('errorMessage'),

  challengeIsTypeQROC: computed('challenge.type', function () {
    return this.get('challenge.type') === 'QROC' || this.get('challenge.type') === 'QROCM';
  }),
  challengeIsTypeQCM: computed.equal('challenge.type', 'QCM'),
  challengeIsTypeQCU: computed.equal('challenge.type', 'QCU'),

  onSelectedProposalChanged: Ember.observer('selectedProposal', function () {
    this.set('errorMessage', null);
  }),

  didUpdateAttrs() {
    this._super(...arguments);
    this.set('selectedProposal', null);
    this.set('answers', {});
  },
  actions: {

    updateQrocAnswer(event) {
      const { name, value } = event.currentTarget;
      this.set(`answers.${name}`, value);
      this.set('errorMessage', null);
    },

    validate() {

      if (this._hasError()) {
        this.set('errorMessage', this._getErrorMessage());
        return this.sendAction('onError', this.get('errorMessage'));
      }
      const value = this._getAnswerValue();
      this.sendAction('onValidated', this.get('challenge'), this.get('assessment'), value);
    },

    skip() {

      this.set('errorMessage', null);
      this.sendAction('onValidated', this.get('challenge'), this.get('assessment'), '#ABAND#')
    }
  },

  _getAnswerValue() {
    const challengeType = this.get('challenge.type');

    switch (challengeType) {
      case 'QCU': {
        const selectedValue = this.get('selectedProposal');
        return `${selectedValue + 1}`;
      }
      case 'QROC':
      case 'QROCM': {
        const answers = this.get('answers');
        return _.pairs(answers).map(([key, value]) => `${key} = "${value}"`).join(', ');
      }
      default:
        return null;
    }
  },

  // eslint-disable-next-line complexity
  _hasError: function () {
    switch (this.get('challenge.type')) {
      case 'QCU':
        return Ember.isEmpty(this.get('selectedProposal'));
      case 'QROC':
      case 'QROCM': {
        const values = _.values(this.get('answers'));
        return (Ember.isEmpty(values) || values.length < 1 || values.every(Ember.isBlank));
      }
      default:
        return false;
    }
  },

  _getErrorMessage: function () {
    switch (this.get('challenge.type')) {
      case 'QCU':
        return "Vous devez sélectionner une proposition, ou passer l'épreuve.";
      case 'QROC':
        return "Vous devez saisir une réponse, ou passer l'épreuve.";
      case 'QROCM':
        return "Vous devez saisir une réponse dans au moins un champ, ou passer l'épreuve.";
      default:
        return "Répondez correctement à l'épreuve, ou passez la réponse."
    }
  }
});

ChallengeItem.reopenClass({
  positionalParams: ['challenge', 'assessment']
});

export default ChallengeItem;
