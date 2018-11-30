import { htmlSafe } from '@ember/string';
import { isPresent } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

  classNames: ['competence-level-progress-bar'],

  _MAX_REACHABLE_LEVEL: 5,
  _MAX_LEVEL: 8,

  competence: {},

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

  canUserStartCourse: computed('competence.{courseId,status}', function() {
    const courseId = this.get('competence.courseId');
    const isCompetenceAssessed = this.get('competence.isAssessed');
    const isCompetenceBeingAssessed = this.get('competence.isBeingAssessed');
    return Boolean(courseId && !isCompetenceAssessed && !isCompetenceBeingAssessed);
  }),

  canUserResumeAssessment: computed('competence.{assessmentId,status}', function() {
    return this.get('competence.isBeingAssessed') && isPresent(this.get('competence.assessmentId'));
  }),

  canUserRetry: computed('competence.{courseId,status}', function() {
    const isCompetenceAssessed = this.get('competence.isAssessed');
    const daysBeforeNewAttempt = this.get('competence.daysBeforeNewAttempt');
    return isCompetenceAssessed && daysBeforeNewAttempt == 0 && isPresent(this.get('competence.courseId'));
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
