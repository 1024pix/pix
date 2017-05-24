import Ember from 'ember';

const contentReference = {
  ok: {
    status: 'ok',
    tooltip: 'Réponse correcte'
  },

  ko: {
    status: 'ko',
    tooltip: 'Réponse incorrecte'
  },

  aband: {
    status: 'aband',
    tooltip: 'Sans réponse'
  },

  partially: {
    status: 'partially',
    tooltip: 'Réponse partielle'
  },

  timedout: {
    status: 'timedout',
    tooltip: 'Temps dépassé'
  },

  default: {
    status: 'default',
    tooltip: 'Correction automatique en cours de développement ;)'
  }
};

const timeOutAfterRender = 1000; //XXX: Wait after attribute rendering

export default Ember.Component.extend({

  classNames: ['result-item'],

  resultItem: Ember.computed('answer.result', function() {
    if (!this.get('answer.result')) return;
    return contentReference[this.get('answer.result')] || contentReference['default'];
  }),

  validationImplementedForChallengeType: Ember.computed('answer.challenge.type', function() {
    const implementedTypes = ['QCM', 'QROC', 'QCU', 'QROCM-ind'];
    const challengeType = this.get('answer.challenge.type');
    return implementedTypes.includes(challengeType);
  }),

  didRender() {
    this._super(...arguments);
    Ember.run.debounce(this, function() {
      $('[data-toggle="tooltip"]').tooltip();
    }, timeOutAfterRender);
  },

  actions: {
    openComparisonPopin() {
      const assessmentId = this.get('answer.assessment.id');
      const answerId = this.get('answer.id');
      const index = this.get('index') + 1;

      this.sendAction('openComparison', assessmentId, answerId, index);
    }
  }
});
