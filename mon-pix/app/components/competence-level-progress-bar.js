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
  daysBeforeReplay: null,

  _showSecondChanceModal: false,

  limitedLevel: computed('level', function() {
    const level = this.get('level');
    return Math.min(level, this.get('_MAX_REACHABLE_LEVEL'));
  }),

  hasLevel: computed('level', function() {
    const level = this.get('level');
    return isPresent(this.get('level')) && level !== -1;
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

  canUserStartCourse: computed('courseId', 'hasLevel', 'assessmentId', function() {
    const courseId = this.get('courseId');
    const hasLevel = this.get('hasLevel');
    const assessmentId = this.get('assessmentId');
    return Boolean(courseId && !hasLevel && !assessmentId);
  }),

  canUserResumeAssessment: computed('assessmentId', 'status', function() {
    return Boolean(this.get('status') === 'notCompleted') && isPresent(this.get('assessmentId'));
  }),

  canUserReplayAssessment: computed('courseId', 'status', function() {
    return Boolean(['evaluated', 'replayed'].includes(this.get('status')) && this.get('daysBeforeReplay') == 0) && isPresent(this.get('courseId'));
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
