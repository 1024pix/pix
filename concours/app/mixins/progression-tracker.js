import EmberObject, { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

const STEPS = {
  COMPLETED: 'completed',
  TO_COMPLETE: null,
};

export default Mixin.create({
  activeStep: null,
  steps: null,
  stepsAhead: null,
  stepsActivated: null,
  progressions: null,

  init() {
    this._super(...arguments);
    this.stepsAhead = this.steps.map(
      (step) => EmberObject.create({ name: step, status: STEPS.TO_COMPLETE })
    );
    this.stepsActivated = [];
    this.next();
  },
  progression: computed('stepsAhead', 'stepActivated', function() {
    return this.stepsActivated.concat(this.stepsAhead);
  }),
  next() {
    if (!this.hasNext()) {
      throw new Error('Tracker error, no more steps');
    }
    const nextStep = this.stepsAhead.shift();
    nextStep.set('status', STEPS.COMPLETED);
    this.stepsActivated.push(nextStep);
    this.set('activeStep', nextStep.name);
  },
  prev() {
    if (!this.hasPrevious()) {
      throw new Error('Tracker error, no steps before');
    }
    const currentStep = this.stepsActivated.pop();
    const previousStep = this.stepsActivated.pop();
    currentStep.set('status', null);
    this.set('stepsAhead', [currentStep, ...this.stepsAhead]);
    this.stepsActivated.push(previousStep);
    this.set('activeStep', previousStep.name);
  },
  hasNext() {
    return this.stepsAhead.length > 0;
  },
  hasPrevious() {
    return this.stepsActivated.length > 1;
  }
});
