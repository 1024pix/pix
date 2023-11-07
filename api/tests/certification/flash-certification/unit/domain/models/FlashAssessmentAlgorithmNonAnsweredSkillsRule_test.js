import { FlashAssessmentAlgorithmNonAnsweredSkillsRule } from '../../../../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithmNonAnsweredSkillsRule.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | FlashAssessmentAlgorithm | FlashAssessmentAlgorithmNonAnsweredSkillsRule', function () {
  describe('#isApplicable', function () {
    describe('when the limitToOneQuestionPerTube is false', function () {
      it('should return true', function () {
        const configuration = {
          limitToOneQuestionPerTube: false,
        };

        expect(FlashAssessmentAlgorithmNonAnsweredSkillsRule.isApplicable(configuration)).to.be.true;
      });
    });
    describe('when the limitToOneQuestionPerTube is true', function () {
      it('should return false', function () {
        const configuration = {
          limitToOneQuestionPerTube: true,
        };

        expect(FlashAssessmentAlgorithmNonAnsweredSkillsRule.isApplicable(configuration)).to.be.false;
      });
    });
  });

  describe('#execute', function () {
    describe('with challenges related to an already answered skill', function () {
      it('should remove the challenges whose skill has already been answered', function () {
        const answeredSkillId = 'answeredSkillId';
        const unansweredSkillId = 'unansweredSkillId';
        const answeredSkill = domainBuilder.buildSkill({
          id: answeredSkillId,
        });
        const unansweredSkill = domainBuilder.buildSkill({
          id: unansweredSkillId,
        });

        const unansweredSkillUnansweredChallenge = domainBuilder.buildChallenge({
          id: 'challenge1',
          skill: unansweredSkill,
        });

        const answeredSkillUnansweredChallenge = domainBuilder.buildChallenge({
          id: 'challenge2',
          skill: answeredSkill,
        });

        const answeredSkillAnsweredChallenge = domainBuilder.buildChallenge({
          id: 'challenge4',
          skill: answeredSkill,
        });

        const answerForChallengeWithAnsweredSkill = domainBuilder.buildAnswer({
          challengeId: answeredSkillAnsweredChallenge.id,
        });

        const allChallenges = [
          unansweredSkillUnansweredChallenge,
          answeredSkillUnansweredChallenge,
          answeredSkillAnsweredChallenge,
        ];

        const allAnswers = [answerForChallengeWithAnsweredSkill];

        expect(
          FlashAssessmentAlgorithmNonAnsweredSkillsRule.execute({
            allChallenges,
            availableChallenges: allChallenges,
            allAnswers,
          }),
        ).to.deep.equal([unansweredSkillUnansweredChallenge]);
      });
    });
  });
});
