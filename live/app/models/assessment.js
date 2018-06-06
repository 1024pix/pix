import { alias, equal } from '@ember/object/computed';
import { computed } from '@ember/object';
import DS from 'ember-data';
import ENV from 'pix-live/config/environment';

const { attr, Model, belongsTo, hasMany } = DS;

const CHECKPOINTS_MAX_STEP = ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT;

export default Model.extend({

  answers: hasMany('answer'),
  course: belongsTo('course', { inverse: null }),
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

  answersSinceLastCheckpoints: computed('answers.[]', function() {

    const howManyAnswersSinceTheLastCheckpoint = this.get('howManyAnswersSinceTheLastCheckpoint');
    const sliceAnswersFrom = (howManyAnswersSinceTheLastCheckpoint === 0)
      ? -CHECKPOINTS_MAX_STEP
      : -howManyAnswersSinceTheLastCheckpoint;

    return this.get('answers').slice(sliceAnswersFrom);
  }),

  howManyAnswersSinceTheLastCheckpoint: computed('answers.[]', function() {
    return this.get('answers.length') % CHECKPOINTS_MAX_STEP;
  }),

  progress: computed('answers', 'course', function() {

    let maxStep;
    if (this.get('hasCheckpoints')) {
      maxStep = CHECKPOINTS_MAX_STEP;
    } else {
      maxStep = this.get('course.nbChallenges');
    }

    const answersCount = this.get('answers.length');
    const currentStep = this._getCurrentStep(answersCount, maxStep);
    const stepPercentage = currentStep / maxStep * 100;

    return { currentStep, maxStep, stepPercentage };
  }),

  _getCurrentStep(answersCount = 0, maxStep) {
    const step = answersCount + 1;

    if (this.get('hasCheckpoints')) {
      return 1 + this.get('howManyAnswersSinceTheLastCheckpoint');
    } else if (maxStep == null) {
      return step;
    } else {
      return Math.min(step, maxStep);
    }
  }
});
