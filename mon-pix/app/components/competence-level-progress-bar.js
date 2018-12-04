import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

  classNames: ['competence-level-progress-bar'],

  _MAX_REACHABLE_LEVEL: 5,
  _MAX_LEVEL: 8,

  _showSecondChanceModal: false,

  limitedLevel: computed('competence.level', function() {
    const level = this.get('competence.level');
    return Math.min(level, this.get('_MAX_REACHABLE_LEVEL'));
  }),

  widthOfProgressBar: computed('limitedLevel', function() {

    const level = this.get('limitedLevel');
    const maxLevel = this.get('_MAX_LEVEL');
    let progressBarWidth;

    if (level === 0) {
      progressBarWidth = '24px';
    } else {
      progressBarWidth = (level * 100 / maxLevel) + '%';
    }

    return htmlSafe('width : ' + progressBarWidth);
  }),

  remainingDaysText: computed('competence.daysBeforeNewAttempt', function() {
    const daysBeforeNewAttempt = this.get('competence.daysBeforeNewAttempt');
    return `dans ${daysBeforeNewAttempt} ${daysBeforeNewAttempt <= 1 ? 'jour' : 'jours'}`;
  }),

  actions: {
    openModal() {
      this.set('_showSecondChanceModal', true);
    },
    closeModal() {
      this.set('_showSecondChanceModal', false);
    },
  },
});
