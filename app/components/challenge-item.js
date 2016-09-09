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
      case 'QCU': {
        const hasError = Ember.isEmpty(this.get('selectedProposal'));
        if (hasError) {
          this.set('errorMessage', "Vous devez sélectionner une proposition.")
        }
        return hasError;
      }
      case 'QROC':
      case 'QROCM': {
        const expectedAnswers = this
          .get('challenge._proposalsAsBlocks')
          .filter((proposal) => proposal.input !== undefined)
          .get('length');
        const values = _.values(this.get('answers'));
        const hasError = (Ember.isEmpty(values) || values.length < expectedAnswers || values.any(Ember.isBlank));
        if (hasError) {
          this.set('errorMessage', "Vous devez saisir une réponse dans tous les champs.");
        }
        return hasError;
      }
      default:
        return false;
    }
  }
});

ChallengeItem.reopenClass({
  positionalParams: ['challenge', 'assessment']
});

export default ChallengeItem;
