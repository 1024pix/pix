import { expect } from '../../../../../test-helper.js';
import { FlashAssessmentAlgorithmRuleEngine } from '../../../../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithmRuleEngine.js';

const challenge1 = Symbol('challenge1');
const challenge2 = Symbol('challenge2');

const inactiveRule = {
  isApplicable: () => false,
  execute: () => [],
};

const ruleThatRemoveChallenge1 = {
  isApplicable: () => true,
  execute: ({ availableChallenges }) => availableChallenges.filter((challenge) => challenge !== challenge1),
};

const ruleThatRemoveChallenge2 = {
  isApplicable: () => true,
  execute: ({ availableChallenges }) => availableChallenges.filter((challenge) => challenge !== challenge2),
};

describe('Unit | Domain | Models | FlashAssessmentAlgorithm | FlashAssessmentAlgorithmRuleEngine', function () {
  describe('when there are no applicable rules', function () {
    it('should not apply the rule', function () {
      const allChallenges = [challenge1, challenge2];

      const availableRules = [inactiveRule];
      const engine = new FlashAssessmentAlgorithmRuleEngine(availableRules, {});

      expect(engine.execute({ allAnswers: [], allChallenges })).to.deep.equal(allChallenges);
    });
  });

  describe('when there is an applicable rule', function () {
    it('should apply the rule', function () {
      const allChallenges = [challenge1, challenge2];

      const availableRules = [ruleThatRemoveChallenge1];
      const engine = new FlashAssessmentAlgorithmRuleEngine(availableRules, {});

      expect(engine.execute({ allAnswers: [], allChallenges })).to.deep.equal([challenge2]);
    });
  });

  describe('when there are multiple applicable rules', function () {
    it('chain the rules', function () {
      const challenge3 = Symbol('challenge3');
      const allChallenges = [challenge1, challenge2, challenge3];

      const availableRules = [inactiveRule, ruleThatRemoveChallenge1, ruleThatRemoveChallenge2];
      const engine = new FlashAssessmentAlgorithmRuleEngine(availableRules, {});

      expect(engine.execute({ allAnswers: [], allChallenges })).to.deep.equal([challenge3]);
    });
  });
});
