import { computed } from '@ember/object';
import Component from '@ember/component';
import ENV from 'mon-pix/config/environment';
import { htmlSafe } from '@ember/string';
import colorGradient from 'mon-pix/utils/color-gradient';

const { and } = computed;

const minWidthPercent = 1.7;
const minWidthPixel = 16;

export default Component.extend({

  showProgressBar: and('media.isDesktop', 'assessment.showProgressBar'),

  currentStepIndex: computed('answerId', 'assessment.answers.[]', 'challengeId', 'maxStepsNumber', function() {
    const persistedAnswers = this.get('assessment.answers').filterBy('isNew', false);
    const currentAnswerId = this.get('answerId');

    let foundIndex = -1;
    persistedAnswers.find((answer, index) => {
      if (answer.id === currentAnswerId) {
        foundIndex = index;
        return true;
      }
      return false;
    });

    if (foundIndex === -1) {
      foundIndex = persistedAnswers.length;
    }

    return foundIndex % this.maxStepsNumber;
  }),

  maxStepsNumber: computed('assessment.{hasCheckpoints,course.nbChallenges}', function() {
    if (this.get('assessment.hasCheckpoints')) {
      return ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
    }

    return this.get('assessment.course.nbChallenges');
  }),

  currentStepNumber: computed('currentStepIndex', function() {
    return this.currentStepIndex + 1;
  }),

  steps: computed('currentStepIndex', 'maxStepsNumber', function() {
    const steps = [];

    const gradient = colorGradient('#388AFF', '#985FFF', this.maxStepsNumber);

    for (let i = 0; i < this.maxStepsNumber; i++) {
      steps.push({
        stepnum: i + 1,
        status: i <= this.currentStepIndex ? 'active' : '',
        background: htmlSafe(`background: ${gradient[i]};`),
      });
    }

    return steps;
  }),

  progressionWidth: computed('currentStepIndex', 'maxStepsNumber', function() {
    const widthPercent = minWidthPercent + (100 - minWidthPercent) * this.currentStepIndex  / (this.maxStepsNumber - 1);

    const width = this.currentStepIndex === 0 ? `${minWidthPixel}px` : `${widthPercent}%`;

    return htmlSafe(`width: ${width};`);
  }),
});
