/* eslint ember/no-classic-classes: 0 */
/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-computed-property-dependencies: 0 */
/* eslint ember/require-tagless-components: 0 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

const contentReference = {
  ok: {
    icon: 'check-circle',
    color: 'green',
  },
  ko: {
    icon: 'times-circle',
    color: 'red',
  },
  aband: {
    icon: 'times-circle',
    color: 'grey',
  },
  partially: {
    icon: 'check-circle',
    color: 'orange',
  },
  timedout: {
    icon: 'times-circle',
    color: 'red',
  },
};

export default Component.extend({
  classNames: ['result-item'],

  intl: service(),

  openComparison: null,

  resultItem: computed('answer.result', function() {
    if (!this.answer.result) return;
    return contentReference[this.answer.result];
  }),

  resultTooltip: computed('resultItem', function() {
    return this.resultItem ? this.intl.t(`pages.result-item.${this.answer.result}`) : null;
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
