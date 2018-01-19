import { htmlSafe } from '@ember/string';
import { isPresent } from '@ember/utils';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

  classNames: ['competence-level-progress-bar'],

  _LIMIT_LEVEL: 5,
  _MAX_LEVEL: 8,

  level: null,
  courseId: null,
  assessmentId: null,
  name: null,
  status: null,

  hasLevel: computed('level', function() {
    const level = this.get('level');
    return isPresent(this.get('level')) && level !== -1;
  }),

  widthOfProgressBar: computed('level', function() {

    const level = this.get('level');
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
    return Boolean(this.get('status') === 'evaluated' && this.get('courseId'));
  })
});
