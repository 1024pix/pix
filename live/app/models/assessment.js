import { alias, equal } from '@ember/object/computed';
import { computed } from '@ember/object';
import DS from 'ember-data';

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

    const NUMBER_OF_CHALLENGES_IN_A_ROW = 5;

    const howManyAnswersSinceTheLastCheckpoint = this.get('answers.length') % NUMBER_OF_CHALLENGES_IN_A_ROW;
    const sliceAnsersFrom = (howManyAnswersSinceTheLastCheckpoint === 0) ? -NUMBER_OF_CHALLENGES_IN_A_ROW: -howManyAnswersSinceTheLastCheckpoint;

    return this.get('answers').slice(sliceAnsersFrom);
  }),

  result: belongsTo('assessment-result'),

  progress: computed('answers', 'course', function() {
    const maxStep = this.get('course.nbChallenges');
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
