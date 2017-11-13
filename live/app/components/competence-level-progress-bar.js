import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['competence-level-progress-bar'],

  _LIMIT_LEVEL: 5,
  _MAX_LEVEL: 8,

  level: null,
  courseId: null,
  assessmentId: null,
  name: null,

  hasLevel: Ember.computed('level', function() {
    const level = this.get('level');
    return Ember.isPresent(this.get('level')) && level !== -1;
  }),

  widthOfProgressBar: Ember.computed('level', function() {

    const level = this.get('level');
    const maxLevel = this.get('_MAX_LEVEL');
    let progressBarWidth;

    if (level === 0) {
      progressBarWidth = '24px';
    } else {
      progressBarWidth = (level * 100 / maxLevel) + '%';
    }

    return Ember.String.htmlSafe('width : ' + progressBarWidth);
  }),

  canUserStartCourse: Ember.computed('courseId', 'hasLevel', 'assessmentId', function() {
    const courseId = this.get('courseId');
    const hasLevel = this.get('hasLevel');
    const assessmentId = this.get('assessmentId');
    return Boolean(courseId && !hasLevel && !assessmentId);
  }),

  canUserResumeAssessment : Ember.computed('assessmentId', 'hasLevel', function() {
    const hasLevel = this.get('hasLevel');
    const assessmentId = this.get('assessmentId');
    return !hasLevel && Ember.isPresent(assessmentId);
  })
});
