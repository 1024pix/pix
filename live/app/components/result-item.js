import Ember from 'ember';
import resultIconUrl from 'pix-live/utils/result-icon-url';

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

export default Ember.Component.extend({

  classNames: [ 'result-item' ],

  attributeBindings: ['tabindex'],

  tabindex: 0,

  resultItem: Ember.computed('answer.result', function() {
    if (!this.get('answer.result')) return;
    return contentReference[this.get('answer.result')] || contentReference['default'];
  }),

  resultTooltip: Ember.computed('resultItem', function() {
    return this.get('resultItem') ? this.get('resultItem').tooltip : null;
  }),

  resultItemIcon: Ember.computed('resultItem', function() {
    return resultIconUrl(this.get('resultItem.status'));
  }),

  validationImplementedForChallengeType: Ember.computed('answer.challenge.type', function() {
    const implementedTypes = [ 'QCM', 'QROC', 'QCU', 'QROCM-ind' ];
    const challengeType = this.get('answer.challenge.type');
    return implementedTypes.includes(challengeType);
  }),

  didRender() {
    this._super(...arguments);

    const tooltipElement = this.$('[data-toggle="tooltip"]');
    const tooltipValue = this.get('resultTooltip');

    if (tooltipValue) {
      tooltipElement.tooltip({ title: tooltipValue });
    }
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
