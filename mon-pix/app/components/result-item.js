import { computed } from '@ember/object';
import Component from '@ember/component';
import resultIconUrl from 'mon-pix/utils/result-icon-url';

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

export default Component.extend({

  classNames: [ 'result-item' ],

  attributeBindings: ['tabindex'],

  tabindex: 0,

  openComparison: null,

  resultItem: computed('answer.result', function() {
    if (!this.get('answer.result')) return;
    return contentReference[this.get('answer.result')] || contentReference['default'];
  }),

  resultTooltip: computed('resultItem', function() {
    return this.resultItem ? this.resultItem.tooltip : null;
  }),

  resultItemIcon: computed('resultItem', function() {
    return resultIconUrl(this.get('resultItem.status'));
  }),

  validationImplementedForChallengeType: computed('answer.challenge.type', function() {
    const implementedTypes = [ 'QCM', 'QROC', 'QCU', 'QROCM-ind', 'QROCM-dep'];
    const challengeType = this.get('answer.challenge.type');
    return implementedTypes.includes(challengeType);
  }),

  didRender() {
    this._super(...arguments);

    const tooltipElement = this.$('[data-toggle="tooltip"]');
    const tooltipValue = this.resultTooltip;

    if (tooltipValue) {
      tooltipElement.tooltip({ title: tooltipValue });
    }
  },

});
