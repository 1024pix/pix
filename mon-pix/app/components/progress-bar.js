import { computed } from '@ember/object';
import Component from '@ember/component';
import ENV from 'mon-pix/config/environment';
import { htmlSafe } from '@ember/string';
import { filterBy } from '@ember/object/computed';

const minWidthPercent = 1.7;
const minWidthPixel = 16;

export default Component.extend({

  didReceiveAttrs() {
    this._setSteps();
    this._setProgressionWidth();
  },

  persistedAnswers: filterBy('assessment.answers.@each.isNew', 'isNew', false),

  maxStepsNumber: computed('assessment.{hasCheckpoints,course.nbChallenges}', function() {
    if (this.get('assessment.hasCheckpoints')) {
      return ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
    }

    return this.get('assessment.course.nbChallenges');
  }),

  currentStepNumber: computed('persistedAnswers.length', 'maxStepsNumber', function() {
    return this.get('persistedAnswers.length') % this.maxStepsNumber;
  }),

  _setSteps() {
    const steps = [];

    for (let i = 0; i < this.maxStepsNumber; i++) {
      steps.push({
        stepnum: i + 1,
        status: i <= this.currentStepNumber ? 'active' : '',
      });
    }

    this.set('steps', steps);
  },

  _setProgressionWidth() {
    const widthPercent = minWidthPercent + (100 - minWidthPercent) * this.currentStepNumber  / (this.maxStepsNumber - 1);

    const width = this.currentStepIndex === 0 ? `${minWidthPixel}px` : `${widthPercent}%`;

    this.set('progressionWidth', htmlSafe(`width: ${width};`));
  },
});
