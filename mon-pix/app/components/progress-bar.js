import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import Component from '@ember/component';
import AssessmentProgression from '../models/assessment-progression';

export default Component.extend({

  // Element
  classNames: ['progress', 'pix-progress-bar'],

  // Data props
  assessment: null,
  nbCurrentAnswers: null,

  // CPs
  progression: computed('assessment.{type,course.nbChallenges}', 'nbCurrentAnswers', function() {
    return new AssessmentProgression({
      assessmentType: this.get('assessment.type'),
      nbAnswers: this.get('nbCurrentAnswers'),
      nbChallenges: this.get('assessment.course.nbChallenges')
    });
  }),

  barStyle: computed('progression', function() {
    return htmlSafe(`width: ${this.get('progression.valueNow')}%`);
  })

});
