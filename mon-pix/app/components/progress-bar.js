import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import Component from '@ember/component';
import AssessmentProgression from '../models/assessment-progression';
import ENV from 'mon-pix/config/environment';

export default Component.extend({

  classNames: ['progress'],
  progression: null,

  setProgression() {
    let challengesToAnswerCount;
    if (this.get('assessment.hasCheckpoints')) {
      challengesToAnswerCount = ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
    } else {
      challengesToAnswerCount = this.get('assessment.course.nbChallenges');
    }
    this.set('progression', AssessmentProgression.create({
      assessmentType: this.get('assessment.type'),
      challengesAnsweredCount: this.get('assessment.answers.length'),
      challengesToAnswerCount,
    }));
  },

  barStyle: computed('progression', function() {
    return htmlSafe(`width: ${this.get('progression.valueNow')}%`);
  }),

  willRender() {
    this.setProgression();
  }

});
