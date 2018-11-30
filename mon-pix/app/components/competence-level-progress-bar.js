import { htmlSafe } from '@ember/string';
import { isPresent } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

  classNames: ['competence-level-progress-bar'],

  _MAX_REACHABLE_LEVEL: 5,
  _MAX_LEVEL: 8,

  level: null,
  courseId: null,
  assessmentId: null,
  name: null,
  status: null,
  daysBeforeNewAttempt: null,

  _showSecondChanceModal: false,

  limitedLevel: computed('level', function() {
    const level = this.get('level');
    return Math.min(level, this.get('_MAX_REACHABLE_LEVEL'));
  }),

  isCompetenceAssessed: computed('status', function() {
    return Boolean(this.get('status') === 'assessed');
  }),

  isCompetenceBeingAssessed: computed('status', function() {
    return Boolean(this.get('status') === 'assessmentNotCompleted');
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

  canUserStartCourse: computed('courseId', 'status', function() {
    const courseId = this.get('courseId');
    const isCompetenceAssessed = this.get('isCompetenceAssessed');
    const isCompetenceBeingAssessed = this.get('isCompetenceBeingAssessed');
    return Boolean(courseId && !isCompetenceAssessed && !isCompetenceBeingAssessed);
  }),

  canUserResumeAssessment: computed('assessmentId', 'status', function() {
    return this.get('isCompetenceBeingAssessed') && isPresent(this.get('assessmentId'));
  }),

  canUserRetry: computed('courseId', 'status', function() {
    return this.get('isCompetenceAssessed') && this.get('daysBeforeNewAttempt') == 0 && isPresent(this.get('courseId'));
  }),

  remainingDaysText: computed('daysBeforeNewAttempt', function() {
    const daysBeforeNewAttempt = this.get('daysBeforeNewAttempt');
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
