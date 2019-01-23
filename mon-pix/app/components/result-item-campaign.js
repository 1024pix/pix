import { computed } from '@ember/object';
import Component from '@ember/component';

const contentReference = {
  ok: {
    icon: 'check-circle',
    color: 'green',
    tooltip: 'Réponse correcte'
  },
  ko: {
    icon: 'times-circle',
    color: 'red',
    tooltip: 'Réponse incorrecte'
  },
  aband: {
    icon: 'times-circle',
    color: 'grey',
    tooltip: 'Sans réponse'
  },
  partially: {
    icon: 'check-circle',
    color: 'orange',
    tooltip: 'Réponse partielle'
  },
  timedout: {
    icon: 'times-circle',
    color: 'red',
    tooltip: 'Temps dépassé'
  },
  default: {
    icon: 'exclamation-circle',
    color: 'blue',
    tooltip: 'Correction automatique en cours de développement ;)'
  }
};

export default Component.extend({

  openComparison: null,

  resultItem: computed('answer.result', function() {
    if (!this.get('answer.result')) return;
    return contentReference[this.get('answer.result')] || contentReference['default'];
  }),

  resultTooltip: computed('resultItem', function() {
    return this.get('resultItem') ? this.get('resultItem').tooltip : null;
  }),

  validationImplementedForChallengeType: computed('answer.challenge.type', function() {
    const implementedTypes = [ 'QCM', 'QROC', 'QCU', 'QROCM-ind' ];
    const challengeType = this.get('answer.challenge.type');
    return implementedTypes.includes(challengeType);
  }),

  isBackgroundColorGrey: computed('index', function() {
    return this.get('index') % 2 === 0;
  }),

  textLength: computed('', function() {
    return window.innerWidth <= 767 ? 60 : 110;
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

      return this.openComparison(assessmentId, answerId, index);
    }
  }
});
