import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default Model.extend({

  name: attr('string'),
  description: attr('string'),
  duration: attr('number'),
  imageUrl: attr('string'),
  isAdaptive: attr('boolean'),
  nbChallenges: attr('number'),
  challenges: hasMany('challenge', { inverse: null }),

  getProgress(challenge) {
    const challengeIndex = this.get('challenges').indexOf(challenge);

    const currentStep = 1 + challengeIndex;
    const maxStep = this.get('challenges.length');
    const stepPercentage = currentStep / maxStep * 100;

    return {
      currentStep: currentStep,
      maxStep: maxStep,
      stepPercentage: stepPercentage
    };
  }
});
