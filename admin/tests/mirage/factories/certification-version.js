import { Factory } from 'miragejs';

export default Factory.extend({
  minimumAnswersRequiredForValidation: 1,
  challengesBetweenSameCompetence: 1,
  defaultProbabilityToPickChallenge: 1,
  variationPercent: 1,
  defaultCandidateCapacity: 1,
  limitToOneQuestionPerTube: true,
  enablePassageByAllCompetences: true,
});
