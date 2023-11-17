import { FlashAssessmentAlgorithmOneQuestionPerTubeRule } from '../../../../../../src/certification/flash-certification/domain/model/FlashAssessmentAlgorithmOneQuestionPerTubeRule.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | FlashAssessmentAlgorithm | FlashAssessmentAlgorithmOneQuestionPerTubeRule', function () {
  describe('#isApplicable', function () {
    describe('when the limitToOneQuestionPerTube is false', function () {
      it('should return false', function () {
        const configuration = {
          limitToOneQuestionPerTube: false,
        };

        expect(FlashAssessmentAlgorithmOneQuestionPerTubeRule.isApplicable(configuration)).to.be.false;
      });
    });
    describe('when the limitToOneQuestionPerTube is true', function () {
      it('should return true', function () {
        const configuration = {
          limitToOneQuestionPerTube: true,
        };

        expect(FlashAssessmentAlgorithmOneQuestionPerTubeRule.isApplicable(configuration)).to.be.true;
      });
    });
  });

  describe('#execute', function () {
    describe('with challenges related to an already answered tube', function () {
      it('should remove the challenges related to the tube', function () {
        const answeredTubeId = 'answeredTube';
        const answeredChallengeId = 'answeredChallengeId';
        const answeredTubeAnsweredSkill = domainBuilder.buildSkill({
          tubeId: answeredTubeId,
        });

        const answeredTubeUnansweredSkill = domainBuilder.buildSkill({
          tubeId: answeredTubeId,
        });

        const unansweredTubeUnansweredSkill = domainBuilder.buildSkill({
          tubeId: 'unansweredTube',
        });

        const answeredTubeAnsweredSkillChallenge = domainBuilder.buildChallenge({
          skill: answeredTubeAnsweredSkill,
          id: answeredChallengeId,
        });

        const answeredTubeUnansweredSkillChallenge = domainBuilder.buildChallenge({
          skill: answeredTubeUnansweredSkill,
          id: 'rec2',
        });

        const unansweredTubeUnansweredSkillChallenge = domainBuilder.buildChallenge({
          skill: unansweredTubeUnansweredSkill,
          id: 'rec3',
        });

        const allChallenges = [
          answeredTubeUnansweredSkillChallenge,
          answeredTubeAnsweredSkillChallenge,
          unansweredTubeUnansweredSkillChallenge,
        ];

        const assessmentAnswers = [
          domainBuilder.buildAnswer({
            challengeId: answeredTubeAnsweredSkillChallenge.id,
          }),
        ];

        expect(
          FlashAssessmentAlgorithmOneQuestionPerTubeRule.execute({
            allChallenges,
            availableChallenges: allChallenges,
            assessmentAnswers,
          }),
        ).to.deep.equal([unansweredTubeUnansweredSkillChallenge]);
      });
    });
  });
});
