import { alias, equal } from '@ember/object/computed';
import { computed } from '@ember/object';
import DS from 'ember-data';

const { attr, Model, belongsTo, hasMany } = DS;

import { getProgressionBehaviorFromAssessmentType } from 'pix-live/models/behaviors/assessment-progression';

export default Model.extend({

  answers: hasMany('answer'),
  course: belongsTo('course', { inverse: null }),
  skillReview: belongsTo('skill-review', { inverse: null }),
  certificationNumber: attr('string'),
  estimatedLevel: attr('number'),
  firstChallenge: alias('course.challenges.firstObject'),
  hasCheckpoints: equal('type', 'SMART_PLACEMENT'),
  isCertification: equal('type', 'CERTIFICATION'),
  pixScore: attr('number'),
  result: belongsTo('assessment-result'),
  type: attr('string'),
  userName: attr('string'),
  userEmail: attr('string'),

  ready() {
    this._progressionBehavior = getProgressionBehaviorFromAssessmentType(this.get('type'));
  },

  answersSinceLastCheckpoints: computed('answers.[]', function() {
    const answers = this.get('answers').toArray();
    return this._progressionBehavior.answersSinceLastCheckpoints(answers);
  }),

  progress: computed('answers', 'course', function() {
    return this._progressionBehavior.progress(
      this.get('answers.length'),
      this.get('course.nbChallenges'),
    );
  }),
});
