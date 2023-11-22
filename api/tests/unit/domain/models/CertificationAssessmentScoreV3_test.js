import _ from 'lodash';

import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { AnswerStatus } from '../../../../lib/domain/models/index.js';
import { CertificationAssessmentScoreV3 } from '../../../../lib/domain/models/CertificationAssessmentScoreV3.js';
import { status } from '../../../../lib/domain/models/AssessmentResult.js';
import { config } from '../../../../src/shared/config.js';

describe('Unit | Domain | Models | CertificationAssessmentScoreV3 ', function () {
  const assessmentId = 1234;

  let answerRepository;
  let challengeRepository;
  let flashAlgorithmService;

  let baseChallenges;
  let baseAnswers;
  let challenge4;

  beforeEach(function () {
    answerRepository = {
      findByAssessment: sinon.stub(),
    };
    challengeRepository = {
      findFlashCompatible: sinon.stub(),
    };
    flashAlgorithmService = {
      getEstimatedLevelAndErrorRate: sinon.stub(),
    };

    const challenge1 = domainBuilder.buildChallenge({
      id: 'recCHAL1',
      discriminant: 1,
      difficulty: 0,
    });
    const challenge2 = domainBuilder.buildChallenge({
      id: 'recCHAL2',
      discriminant: 1,
      difficulty: 4,
    });
    const challenge3 = domainBuilder.buildChallenge({
      id: 'recCHAL3',
      discriminant: 1,
      difficulty: 2,
    });

    challenge4 = domainBuilder.buildChallenge({
      id: 'recCHAL4',
      discriminant: 1,
      difficulty: 2,
    });

    const answer1 = domainBuilder.buildAnswer({
      id: 'ans1',
      challengeId: challenge1.id,
    });

    const answer2 = domainBuilder.buildAnswer({
      id: 'ans2',
      challengeId: challenge2.id,
      result: AnswerStatus.KO,
    });

    const answer3 = domainBuilder.buildAnswer({
      id: 'ans3',
      challengeId: challenge3.id,
    });

    baseChallenges = [challenge1, challenge2, challenge3, challenge4];
    baseAnswers = [answer1, answer3, answer2];
  });

  it('should return the score', async function () {
    const expectedEstimatedLevel = 2;
    const expectedScoreForEstimatedLevel = 592;

    answerRepository.findByAssessment.withArgs(assessmentId).resolves(baseAnswers);
    challengeRepository.findFlashCompatible.withArgs().resolves(baseChallenges);
    flashAlgorithmService.getEstimatedLevelAndErrorRate
      .withArgs(
        _getEstimatedLevelAndErrorRateParams({
          challenges: baseChallenges,
          allAnswers: baseAnswers,
          estimatedLevel: sinon.match.number,
        }),
      )
      .returns({
        estimatedLevel: expectedEstimatedLevel,
      });

    const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
      challenges: baseChallenges,
      allAnswers: baseAnswers,
      flashAlgorithmService,
    });

    expect(score.nbPix).to.equal(expectedScoreForEstimatedLevel);
  });

  describe('when we reach an estimated level below the MINIMUM', function () {
    it('the score should be 0', function () {
      // given
      const veryLowEstimatedLevel = -9;
      const veryEasyDifficulty = -8;
      const numberOfChallenges = 32;
      const challenges = _buildChallenges(veryEasyDifficulty, numberOfChallenges);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.KO);

      flashAlgorithmService.getEstimatedLevelAndErrorRate
        .withArgs(
          _getEstimatedLevelAndErrorRateParams({
            challenges,
            allAnswers,
            estimatedLevel: sinon.match.number,
          }),
        )
        .returns({
          estimatedLevel: veryLowEstimatedLevel,
        });

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        flashAlgorithmService,
      });

      // then
      expect(score.nbPix).to.equal(0);
    });
  });

  describe('when we reach an estimated level above the MAXIMUM', function () {
    it('the score should be 1024', function () {
      // given
      const veryHighEstimatedLevel = 1200;
      const veryHardDifficulty = 8;
      const numberOfChallenges = 32;
      const challenges = _buildChallenges(veryHardDifficulty, numberOfChallenges);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

      flashAlgorithmService.getEstimatedLevelAndErrorRate
        .withArgs(
          _getEstimatedLevelAndErrorRateParams({
            challenges,
            allAnswers,
            estimatedLevel: sinon.match.number,
          }),
        )
        .returns({
          estimatedLevel: veryHighEstimatedLevel,
        });

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        flashAlgorithmService,
      });

      // then
      expect(score.nbPix).to.equal(1024);
    });
  });

  describe('status', function () {
    describe('when a certification has config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification or more answers', function () {
      it('should be validated', function () {
        const difficulty = 0;
        const numberOfChallenges = config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
        const challenges = _buildChallenges(difficulty, numberOfChallenges);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

        flashAlgorithmService.getEstimatedLevelAndErrorRate
          .withArgs(
            _getEstimatedLevelAndErrorRateParams({
              challenges,
              allAnswers,
              estimatedLevel: sinon.match.number,
            }),
          )
          .returns({
            estimatedLevel: 0,
          });

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          flashAlgorithmService,
        });

        expect(score.status).to.equal(status.VALIDATED);
      });
    });

    describe('when a certification has less than config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification answers', function () {
      it('should be rejected', function () {
        const difficulty = 0;
        const numberOfChallenges = config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification - 1;
        const challenges = _buildChallenges(difficulty, numberOfChallenges);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
        flashAlgorithmService.getEstimatedLevelAndErrorRate
          .withArgs(
            _getEstimatedLevelAndErrorRateParams({
              challenges,
              allAnswers,
              estimatedLevel: sinon.match.number,
            }),
          )
          .returns({
            estimatedLevel: 0,
          });

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          flashAlgorithmService,
        });

        expect(score.status).to.equal(status.REJECTED);
      });
    });
  });
});

const _buildChallenges = (difficulty, numberOfChallenges) => {
  const discriminant = 1;

  return _.range(0, numberOfChallenges).map((index) =>
    domainBuilder.buildChallenge({
      id: `recCHALL${index}`,
      difficulty,
      discriminant,
    }),
  );
};

const _getEstimatedLevelAndErrorRateParams = (params) => ({
  ...params,
  doubleMeasuresUntil: undefined,
  variationPercent: undefined,
});

const _buildAnswersForChallenges = (challenges, answerResult) => {
  return challenges.map(({ id: challengeId }) =>
    domainBuilder.buildAnswer({
      result: answerResult,
      challengeId,
    }),
  );
};
