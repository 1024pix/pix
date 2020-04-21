import Component from '@ember/component';
import { computed } from '@ember/object';

const contentReference = {
  ok: {
    icon: 'check-circle',
    color: 'green',
    title: 'Réponse correcte'
  },
  ko: {
    icon: 'times-circle',
    color: 'red',
    title: 'Réponse incorrecte'
  },
  aband: {
    icon: 'times-circle',
    color: 'grey',
    title: 'Sans réponse'
  },
  partially: {
    icon: 'check-circle',
    color: 'orange',
    title: 'Réponse partielle'
  },
  timedout: {
    icon: 'times-circle',
    color: 'red',
    title: 'Temps dépassé'
  }
};

export default Component.extend({
  classNames: ['result-item'],

  openComparison: null,

  resultItem: computed('answer.result', function() {
    if (!this.answer.result) return;
    return contentReference[this.answer.result];
  }),

  resultTooltip: computed('resultItem', function() {
    return this.resultItem ? this.resultItem.title : null;
  }),

  validationImplementedForChallengeType: computed('answer.challenge.type', function() {
    const implementedTypes = ['QCM', 'QROC', 'QCU', 'QROCM-ind', 'QROCM-dep'];
    const challengeType = this.answer.get('challenge.type');
    return implementedTypes.includes(challengeType);
  }),

  textLength: computed('', function() {
    return window.innerWidth <= 767 ? 60 : 110;
  }),

});
