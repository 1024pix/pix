import EmberObject from '@ember/object';
import { computed } from '@ember/object';
import ENV from 'mon-pix/config/environment';

const FIRST_STEP_VALUE = 1;
const ONE_HUNDRED_PERCENT = 100;

const CHECKPOINTS_MAX_STEPS = ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;

export default EmberObject.extend({

  // Data props
  assessmentType: null,
  challengesAnsweredCount: null,
  challengesToAnswerCount: null,

  // CPs
  _currentStep: computed('assessmentType', 'challengesAnsweredCount', 'challengesToAnswerCount', function() {
    const assessmentType = this.assessmentType;
    const challengesAnsweredCount = this.challengesAnsweredCount;
    if (assessmentType === 'COMPETENCE_EVALUATION' || assessmentType === 'SMART_PLACEMENT') {
      return FIRST_STEP_VALUE + challengesAnsweredCount % CHECKPOINTS_MAX_STEPS;
    }
    return Math.min(FIRST_STEP_VALUE + challengesAnsweredCount, this.challengesToAnswerCount);
  }),

  _maxSteps: computed('assessmentType', 'challengesToAnswerCount', function() {
    const assessmentType = this.assessmentType;
    if (assessmentType === 'COMPETENCE_EVALUATION' || assessmentType === 'SMART_PLACEMENT') {
      return CHECKPOINTS_MAX_STEPS;
    }
    return this.challengesToAnswerCount;
  }),

  valueNow: computed('_currentStep', '_maxSteps', function() {
    return this._currentStep / this._maxSteps * ONE_HUNDRED_PERCENT;
  }),

  text: computed('_currentStep', '_maxSteps', function() {
    return `${this._currentStep}/${this._maxSteps}`;
  })

});

