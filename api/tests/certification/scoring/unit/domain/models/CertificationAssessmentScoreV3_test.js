import _ from 'lodash';

import { AnswerStatus } from '../../../../../../lib/domain/models/index.js';
import { CertificationAssessmentScoreV3 } from '../../../../../../src/certification/scoring/domain/models/CertificationAssessmentScoreV3.js';
import { ABORT_REASONS } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { config } from '../../../../../../src/shared/config.js';
import { status } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | CertificationAssessmentScoreV3 ', function () {
  const maxReachableLevelOnCertificationDate = 7;

  const competenceId = 'recCompetenceId';
  const areaCode = '1';
  const competenceCode = '1.1';

  let algorithm;
  let scoringDegradationService;
  let v3CertificationScoring;

  beforeEach(function () {
    algorithm = {
      getCapacityAndErrorRate: sinon.stub(),
      getConfiguration: sinon.stub(),
    };
    scoringDegradationService = { downgradeCapacity: sinon.stub() };
    v3CertificationScoring = domainBuilder.buildV3CertificationScoring({
      competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
    });
  });

  describe('when the candidate finished the test', function () {
    it('should return the full score', async function () {
      const expectedCapacity = 2;
      const expectedScoreForCapacity = 639;

      const numberOfQuestions = 32;

      const challenges = _buildChallenges(0, numberOfQuestions);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

      algorithm.getCapacityAndErrorRate
        .withArgs({
          challenges,
          allAnswers,
        })
        .returns({
          capacity: expectedCapacity,
        });

      algorithm.getConfiguration.returns(
        domainBuilder.buildFlashAlgorithmConfiguration({
          maximumAssessmentLength: numberOfQuestions,
        }),
      );

      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
        v3CertificationScoring,
        scoringDegradationService,
      });

      expect(score.nbPix).to.equal(expectedScoreForCapacity);
    });

    it('should return the competence marks', async function () {
      const expectedCapacity = 2;

      const numberOfQuestions = 32;

      const challenges = _buildChallenges(0, numberOfQuestions);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

      algorithm.getCapacityAndErrorRate
        .withArgs({
          challenges,
          allAnswers,
        })
        .returns({
          capacity: expectedCapacity,
        });

      algorithm.getConfiguration.returns(
        domainBuilder.buildFlashAlgorithmConfiguration({
          maximumAssessmentLength: numberOfQuestions,
        }),
      );

      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
        v3CertificationScoring,
        scoringDegradationService,
      });

      expect(score.competenceMarks).to.deep.equal([
        domainBuilder.buildCompetenceMark({
          competenceId,
          area_code: areaCode,
          competence_code: competenceCode,
          level: 2,
          score: 0,
        }),
      ]);
    });
  });

  describe('when the candidate did not finish the test', function () {
    describe('when the abort reason is technical difficulties', function () {
      it('should return the raw score', async function () {
        const expectedCapacity = 2;
        const expectedScoreForCapacity = 639;

        const numberOfAnsweredQuestions = 20;
        const numberCertificationQuestions = 32;

        const challenges = _buildChallenges(0, numberOfAnsweredQuestions);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
        const abortReason = ABORT_REASONS.TECHNICAL;

        algorithm.getCapacityAndErrorRate
          .withArgs({
            challenges,
            allAnswers,
          })
          .returns({
            capacity: expectedCapacity,
          });

        algorithm.getConfiguration.returns(
          domainBuilder.buildFlashAlgorithmConfiguration({
            maximumAssessmentLength: numberCertificationQuestions,
          }),
        );

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
          abortReason,
          maxReachableLevelOnCertificationDate,
          v3CertificationScoring,
          scoringDegradationService,
        });

        expect(score.nbPix).to.equal(expectedScoreForCapacity);
      });

      it('should return the competence marks', async function () {
        const expectedCapacity = 2;

        const numberOfAnsweredQuestions = 20;
        const numberCertificationQuestions = 32;

        const challenges = _buildChallenges(0, numberOfAnsweredQuestions);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
        const abortReason = ABORT_REASONS.TECHNICAL;

        algorithm.getCapacityAndErrorRate
          .withArgs({
            challenges,
            allAnswers,
          })
          .returns({
            capacity: expectedCapacity,
          });

        algorithm.getConfiguration.returns(
          domainBuilder.buildFlashAlgorithmConfiguration({
            maximumAssessmentLength: numberCertificationQuestions,
          }),
        );

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
          abortReason,
          maxReachableLevelOnCertificationDate,
          v3CertificationScoring,
          scoringDegradationService,
        });

        expect(score.competenceMarks).to.deep.equal([
          domainBuilder.buildCompetenceMark({
            competenceId,
            area_code: areaCode,
            competence_code: competenceCode,
            level: 2,
            score: 0,
          }),
        ]);
      });
    });

    describe('when the abort reason is that the candidate did not finish', function () {
      it('should downgrade capacity', async function () {
        const expectedCapacity = 2;

        const numberOfAnsweredQuestions = 29;
        const numberCertificationQuestions = 32;

        const challenges = _buildChallenges(0, numberOfAnsweredQuestions);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
        const abortReason = ABORT_REASONS.CANDIDATE;

        const skill = domainBuilder.buildSkill({ id: 'recSkill1' });
        const locales = ['fr-fr'];

        const activeChallenge = domainBuilder.buildChallenge({
          id: 'activeChallenge',
          skill,
          status: 'validé',
          locales,
        });
        const archivedChallenge = domainBuilder.buildChallenge({
          id: 'archivedChallenge',
          skill,
          status: 'archivé',
          locales,
        });
        const outdatedChallenge = domainBuilder.buildChallenge({
          id: 'outdatedChallenge',
          skill,
          status: 'périmé',
          locales,
        });

        const flashAssessmentAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
          maximumAssessmentLength: numberCertificationQuestions,
        });

        algorithm.getCapacityAndErrorRate
          .withArgs({
            challenges,
            allAnswers,
          })
          .returns({
            capacity: expectedCapacity,
          });

        scoringDegradationService.downgradeCapacity.returns(1);

        algorithm.getConfiguration.returns(flashAssessmentAlgorithmConfiguration);

        CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          allChallenges: [activeChallenge, archivedChallenge, outdatedChallenge],
          algorithm,
          abortReason,
          maxReachableLevelOnCertificationDate,
          v3CertificationScoring,
          scoringDegradationService,
        });

        expect(scoringDegradationService.downgradeCapacity).to.have.been.calledWithExactly({
          algorithm,
          capacity: expectedCapacity,
          allChallenges: [activeChallenge, archivedChallenge, outdatedChallenge],
          allAnswers,
          flashAssessmentAlgorithmConfiguration,
        });
      });
    });
  });

  describe('when we reach an estimated level below the MINIMUM', function () {
    it('the score should be 0', function () {
      // given
      const veryLowCapacity = -9;
      const veryEasyDifficulty = -8;
      const numberOfChallenges = 32;
      const challenges = _buildChallenges(veryEasyDifficulty, numberOfChallenges);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.KO);

      algorithm.getCapacityAndErrorRate
        .withArgs({
          challenges,
          allAnswers,
        })
        .returns({
          capacity: veryLowCapacity,
        });
      algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
        v3CertificationScoring,
        scoringDegradationService,
      });

      // then
      expect(score.nbPix).to.equal(0);
    });

    it('should return the competence marks', function () {
      // given
      const veryLowCapacity = -9;
      const veryEasyDifficulty = -8;
      const numberOfChallenges = 32;
      const challenges = _buildChallenges(veryEasyDifficulty, numberOfChallenges);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.KO);

      algorithm.getCapacityAndErrorRate
        .withArgs({
          challenges,
          allAnswers,
        })
        .returns({
          capacity: veryLowCapacity,
        });
      algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
        v3CertificationScoring,
        scoringDegradationService,
      });

      // then
      expect(score.competenceMarks).to.deep.equal([
        domainBuilder.buildCompetenceMark({
          competenceId,
          area_code: areaCode,
          competence_code: competenceCode,
          level: 0,
          score: 0,
        }),
      ]);
    });
  });

  describe('when we reach an estimated level above the MAXIMUM', function () {
    it('the score should be the maximum score reachable at the moment', function () {
      // given
      const veryHighCapacity = 1200;
      const veryHardDifficulty = 8;
      const numberOfChallenges = 32;
      const challenges = _buildChallenges(veryHardDifficulty, numberOfChallenges);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

      algorithm.getCapacityAndErrorRate
        .withArgs({
          challenges,
          allAnswers,
        })
        .returns({
          capacity: veryHighCapacity,
        });
      algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
        v3CertificationScoring,
        scoringDegradationService,
      });

      // then
      expect(score.nbPix).to.equal(895);
    });

    it('should return the competence marks', function () {
      // given
      const veryHighCapacity = 1200;
      const veryHardDifficulty = 8;
      const numberOfChallenges = 32;
      const challenges = _buildChallenges(veryHardDifficulty, numberOfChallenges);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

      algorithm.getCapacityAndErrorRate
        .withArgs({
          challenges,
          allAnswers,
        })
        .returns({
          capacity: veryHighCapacity,
        });
      algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges,
        allAnswers,
        algorithm,
        maxReachableLevelOnCertificationDate,
        v3CertificationScoring,
        scoringDegradationService,
      });

      // then
      expect(score.competenceMarks).to.deep.equal([
        domainBuilder.buildCompetenceMark({
          competenceId,
          area_code: areaCode,
          competence_code: competenceCode,
          level: 2,
          score: 0,
        }),
      ]);
    });
  });

  describe('status', function () {
    describe('when at least the minimum number of answers required by the config has been answered', function () {
      it('should be validated', function () {
        const difficulty = 0;
        const numberOfChallenges = config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
        const challenges = _buildChallenges(difficulty, numberOfChallenges);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

        algorithm.getCapacityAndErrorRate
          .withArgs({
            challenges,
            allAnswers,
          })
          .returns({
            capacity: 0,
          });

        algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
          maxReachableLevelOnCertificationDate,
          v3CertificationScoring,
          scoringDegradationService,
        });

        expect(score.status).to.equal(status.VALIDATED);
      });
    });

    describe('when less than the minimum number of answers required by the config has been answered', function () {
      describe('when the candidate did not finish the test due to technical issues', function () {
        it('should be cancelled', function () {
          const difficulty = 0;
          const numberOfChallenges = config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification - 1;
          const challenges = _buildChallenges(difficulty, numberOfChallenges);
          const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
          algorithm.getCapacityAndErrorRate
            .withArgs({
              challenges,
              allAnswers,
            })
            .returns({
              capacity: 0,
            });

          algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

          const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
            challenges,
            allAnswers,
            algorithm,
            abortReason: 'candidate',
            maxReachableLevelOnCertificationDate,
            v3CertificationScoring,
            scoringDegradationService,
          });

          expect(score.status).to.equal(status.REJECTED);
        });
      });

      describe('when the candidate did not finish the test due to time issues', function () {
        it('should be rejected', function () {
          const difficulty = 0;
          const numberOfChallenges = config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification - 1;
          const challenges = _buildChallenges(difficulty, numberOfChallenges);
          const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
          algorithm.getCapacityAndErrorRate
            .withArgs({
              challenges,
              allAnswers,
            })
            .returns({
              capacity: 0,
            });

          algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

          const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
            challenges,
            allAnswers,
            algorithm,
            abortReason: 'candidate',
            maxReachableLevelOnCertificationDate,
            v3CertificationScoring,
            scoringDegradationService,
          });

          expect(score.status).to.equal(status.REJECTED);
        });
      });
    });

    describe('when less than the minimum number of answers required by the config has been answered and the candidate didnt quit', function () {
      it('should be validated', function () {
        const difficulty = 0;
        const certificationCourseAbortReason = 'technical';
        const numberOfChallenges = config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification - 1;
        const challenges = _buildChallenges(difficulty, numberOfChallenges);
        const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);
        algorithm.getCapacityAndErrorRate
          .withArgs({
            challenges,
            allAnswers,
          })
          .returns({
            capacity: 0,
          });

        algorithm.getConfiguration.returns(domainBuilder.buildFlashAlgorithmConfiguration());

        const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
          challenges,
          allAnswers,
          algorithm,
          certificationCourseAbortReason,
          maxReachableLevelOnCertificationDate,
          v3CertificationScoring,
          scoringDegradationService,
        });

        expect(score.status).to.equal(status.VALIDATED);
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

const _buildAnswersForChallenges = (challenges, answerResult) => {
  return challenges.map(({ id: challengeId }) =>
    domainBuilder.buildAnswer({
      result: answerResult,
      challengeId,
    }),
  );
};
