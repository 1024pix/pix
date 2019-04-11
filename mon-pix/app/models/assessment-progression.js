import EmberObject from '@ember/object';
import { computed } from '@ember/object';
import ENV from 'mon-pix/config/environment';

const FIRST_STEP_VALUE = 1;
const ONE_HUNDRED_PERCENT = 100;

const CHECKPOINTS_MAX_STEPS = ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT;

export default EmberObject.extend({

  // Data props
  assessmentType: null,
  nbAnswers: null,
  nbChallenges: null,

  // CPs
  _currentStep: computed('assessmentType', 'nbAnswers', 'nbChallenges', function() {
    const assessmentType = this.assessmentType;
    const nbAnswers = this.nbAnswers;
    if (assessmentType === 'COMPETENCE_EVALUATION' || assessmentType === 'SMART_PLACEMENT') {
      return FIRST_STEP_VALUE + nbAnswers % CHECKPOINTS_MAX_STEPS;
    }
    return Math.min(FIRST_STEP_VALUE + nbAnswers, this.nbChallenges);
  }),

  _maxSteps: computed('assessmentType', 'nbChallenges', function() {
    const assessmentType = this.assessmentType;
    if (assessmentType === 'COMPETENCE_EVALUATION' || assessmentType === 'SMART_PLACEMENT') {
      return CHECKPOINTS_MAX_STEPS;
    }
    return this.nbChallenges;
  }),

  valueNow: computed('_currentStep', '_maxSteps', function() {
    return this._currentStep / this._maxSteps * ONE_HUNDRED_PERCENT;
  }),

  text: computed('_currentStep', '_maxSteps', function() {
    return `${this._currentStep}/${this._maxSteps}`;
  })

});

