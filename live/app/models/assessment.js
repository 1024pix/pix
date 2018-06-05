import { alias, equal } from '@ember/object/computed';
import { computed } from '@ember/object';
import DS from 'ember-data';
import ENV from 'pix-live/config/environment';

const { attr, Model, belongsTo, hasMany } = DS;

export default Model.extend({

  course: belongsTo('course', { inverse: null }),
  answers: hasMany('answer'),
  userName: attr('string'),
  userEmail: attr('string'),
  firstChallenge: alias('course.challenges.firstObject'),
  estimatedLevel: attr('number'),
  pixScore: attr('number'),
  type: attr('string'),
  certificationNumber: attr('string'),
  isCertification: equal('type', 'CERTIFICATION'),

  hasCheckpoints: equal('type', 'SMART_PLACEMENT'),
  answersSinceLastCheckpoints: computed('answers.[]', function() {

    const howManyAnswersSinceTheLastCheckpoint = this.get('answers.length') % ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT;
    const sliceAnswersFrom = (howManyAnswersSinceTheLastCheckpoint === 0)
      ? -ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT
      : -howManyAnswersSinceTheLastCheckpoint;

    return this.get('answers').slice(sliceAnswersFrom);
  }),

  result: belongsTo('assessment-result'),

  progress: computed('answers', 'course', function() {

    let maxStep;
    if (this.get('type') === 'SMART_PLACEMENT') {
      maxStep = 5;
    } else {
      maxStep = this.get('course.nbChallenges');
    }

    const answersCount = this.get('answers.length');
    const currentStep = _getCurrentStep(answersCount, maxStep);
    const stepPercentage = currentStep / maxStep * 100;

    return { currentStep, maxStep, stepPercentage };
  }),

});

function _getCurrentStep(answersCount, maxStep) {
  const step = answersCount + 1;

  return (step > maxStep) ? maxStep : step;
}
