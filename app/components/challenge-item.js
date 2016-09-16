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
  hasAttachment: computed.notEmpty('challenge.attachmentUrl'),
  isChallengePreviewMode: computed.empty('assessment'),
  hasError: computed.notEmpty('errorMessage'),

  // FIXME: too much duplication :x
  challengeIsTypeQROC: computed('challenge.type', function () {
    const challengeType = this.get('challenge.type');
    return ['QROC', 'QROCM'].any((type) => type === challengeType);
  }),
  challengeIsTypeQCM: computed('challenge.type', function () {
    const challengeType = this.get('challenge.type');
    return ['QCM', 'QCMIMG'].any((type) => type === challengeType);
  }),
  challengeIsTypeQCU: computed('challenge.type', function () {
    const challengeType = this.get('challenge.type');
    return ['QCU', 'QCUIMG'].any((type) => type === challengeType);
  }),

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

    updateQcmAnswer(event) {
      const { name, checked } = event.currentTarget;
      let answers = this.get('answers');

      if (checked) {
        if (Ember.isArray(answers)) {
          answers.push(name);
        }
        else {
          answers = [name];
        }
      }
      else {
        _.remove(answers, (answer) => answer === name);
      }

      this.set('answers', answers);
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

  // eslint-disable-next-line complexity
  _getAnswerValue() {
    const challengeType = this.get('challenge.type');

    switch (challengeType) {
      case 'QCUIMG':
      case 'QCU': {
        const selectedValue = this.get('selectedProposal');
        return `${selectedValue + 1}`;
      }
      case 'QCMIMG':
      case 'QCM': {
        const answers = this.get('answers');
        return `${answers.map((answer) => parseInt(answer, 10) + 1).join(', ')}`;
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
      case 'QCUIMG':
      case 'QCU':
        return Ember.isEmpty(this.get('selectedProposal'));
      case 'QCMIMG':
      case 'QCM':
        return !(this.get('answers.length') >= 1);
      case 'QROC':
      case 'QROCM': {
        const values = _.values(this.get('answers'));
        return (Ember.isEmpty(values) || values.length < 1 || values.every(Ember.isBlank));
      }
      default:
        return false;
    }
  },

  // eslint-disable-next-line complexity
  _getErrorMessage: function () {
    switch (this.get('challenge.type')) {
      case 'QCUIMG':
      case 'QCU':
        return "Pour valider, sélectionner une réponse. Sinon, passer.";
      case 'QCMIMG':
      case 'QCM':
        return "Pour valider, sélectionner au moins une réponse. Sinon, passer.";
      case 'QROC':
        return "Pour valider, saisir une réponse. Sinon, passer.";
      case 'QROCM':
        return "Pour valider, saisir au moins une réponse. Sinon, passer.";
      default:
        return "Pour valider, répondez correctement à l'épreuve. Sinon passer.";
    }
  }
});

ChallengeItem.reopenClass({
  positionalParams: ['challenge', 'assessment']
});

export default ChallengeItem;
