import { computed } from '@ember/object';
import DS from 'ember-data';

const { attr, Model, belongsTo, hasMany } = DS;

export default Model.extend({

  course: belongsTo('course', { inverse: null }),
  answers: hasMany('answer'),
  userName: attr('string'),
  userEmail: attr('string'),
  firstChallenge: computed.alias('course.challenges.firstObject'),
  estimatedLevel: attr('number'),
  pixScore: attr('number'),
  type: attr('string'),
  certificationNumber: attr('string'),
  isCertification: computed.equal('type', 'CERTIFICATION'),

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
