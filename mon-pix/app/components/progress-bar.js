import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import Component from '@ember/component';
import AssessmentProgression from '../models/assessment-progression';

export default Component.extend({
  classNames: ['progress'],

  progression: computed('assessment.{type,answers,course.nbChallenges}', function() {
    return new AssessmentProgression({
      assessmentType: this.get('assessment.type'),
      nbAnswers: this.get('assessment.answers.length'),
      nbChallenges: this.get('assessment.course.nbChallenges')
    });
  }),

  barStyle: computed('progression', function() {
    return htmlSafe(`width: ${this.get('progression.valueNow')}%`);
  })
});
