import _ from 'lodash';

import { ChallengeDeneutralized } from '../../../../../../../src/certification/evaluation/domain/events/ChallengeDeneutralized.js';
import { ChallengeNeutralized } from '../../../../../../../src/certification/evaluation/domain/events/ChallengeNeutralized.js';
import {
  calculateCertificationAssessmentScore,
  handleV2CertificationScoring,
} from '../../../../../../../src/certification/evaluation/domain/services/scoring/scoring-v2.js';
// TODO : cross-bounded context violation
import {
  CertificationAssessment,
  states,
} from '../../../../../../../src/certification/session-management/domain/models/CertificationAssessment.js';
import { AlgorithmEngineVersion } from '../../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { ABORT_REASONS } from '../../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { AutoJuryCommentKeys } from '../../../../../../../src/certification/shared/domain/models/JuryComment.js';
import * as scoringService from '../../../../../../../src/evaluation/domain/services/scoring/scoring-service.js';
import { CertificationComputeError } from '../../../../../../../src/shared/domain/errors.js';
import CertificationCancelled from '../../../../../../../src/shared/domain/events/CertificationCancelled.js';
import { AssessmentResult, status } from '../../../../../../../src/shared/domain/models/AssessmentResult.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../../test-helper.js';

function _buildUserCompetence(competence, pixScore, estimatedLevel) {
  return domainBuilder.buildUserCompetence({ ...competence, estimatedLevel, pixScore });
}

const pixForCompetence1 = 10;
const pixForCompetence2 = 20;
const pixForCompetence3 = 30;
const pixForCompetence4 = 40;
const UNCERTIFIED_LEVEL = -1;

const correctAnswersForAllChallenges = () =>
  _.map(
    [
      { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
      { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
      { challengeId: 'challenge_C_for_competence_1', result: 'ok' },
      { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
      { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
      { challengeId: 'challenge_F_for_competence_2', result: 'ok' },
      { challengeId: 'challenge_G_for_competence_3', result: 'ok' },
      { challengeId: 'challenge_H_for_competence_3', result: 'ok' },
      { challengeId: 'challenge_I_for_competence_3', result: 'ok' },
      { challengeId: 'challenge_J_for_competence_4', result: 'ok' },
      { challengeId: 'challenge_K_for_competence_4', result: 'ok' },
      { challengeId: 'challenge_L_for_competence_4', result: 'ok' },
    ],
    domainBuilder.buildAnswer,
  );

const wrongAnswersForAllChallenges = () =>
  _.map(
    [
      { challengeId: 'challenge_A_for_competence_1', result: 'ko' },
      { challengeId: 'challenge_B_for_competence_1', result: 'ko' },
      { challengeId: 'challenge_C_for_competence_1', result: 'ko' },
      { challengeId: 'challenge_D_for_competence_2', result: 'ko' },
      { challengeId: 'challenge_E_for_competence_2', result: 'ko' },
      { challengeId: 'challenge_F_for_competence_2', result: 'ko' },
      { challengeId: 'challenge_G_for_competence_3', result: 'ko' },
      { challengeId: 'challenge_H_for_competence_3', result: 'ko' },
      { challengeId: 'challenge_I_for_competence_3', result: 'ko' },
      { challengeId: 'challenge_J_for_competence_4', result: 'ko' },
      { challengeId: 'challenge_K_for_competence_4', result: 'ko' },
      { challengeId: 'challenge_L_for_competence_4', result: 'ko' },
    ],
    domainBuilder.buildAnswer,
  );

const answersToHaveOnlyTheLastCompetenceFailed = () =>
  _.map(
    [
      { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
      { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
      { challengeId: 'challenge_C_for_competence_1', result: 'ok' },
      { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
      { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
      { challengeId: 'challenge_F_for_competence_2', result: 'ok' },
      { challengeId: 'challenge_G_for_competence_3', result: 'ok' },
      { challengeId: 'challenge_H_for_competence_3', result: 'ok' },
      { challengeId: 'challenge_I_for_competence_3', result: 'ok' },
      { challengeId: 'challenge_J_for_competence_4', result: 'ko' },
      { challengeId: 'challenge_K_for_competence_4', result: 'ko' },
      { challengeId: 'challenge_L_for_competence_4', result: 'ko' },
    ],
    domainBuilder.buildAnswer,
  );

const answersWithReproducibilityRateLessThan80 = () =>
  _.map(
    [
      { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
      { challengeId: 'challenge_B_for_competence_1', result: 'ko' },
      { challengeId: 'challenge_C_for_competence_1', result: 'ok' },
      { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
      { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
      { challengeId: 'challenge_F_for_competence_2', result: 'ok' },
      { challengeId: 'challenge_G_for_competence_3', result: 'ok' },
      { challengeId: 'challenge_H_for_competence_3', result: 'ko' },
      { challengeId: 'challenge_I_for_competence_3', result: 'ko' },
      { challengeId: 'challenge_J_for_competence_4', result: 'ok' },
      { challengeId: 'challenge_K_for_competence_4', result: 'ko' },
      { challengeId: 'challenge_L_for_competence_4', result: 'ok' },
    ],
    domainBuilder.buildAnswer,
  );

const challenges = _.map(
  [
    {
      challengeId: 'challenge_A_for_competence_1',
      competenceId: 'competence_1',
      associatedSkillName: '@skillChallengeA_1',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_C_for_competence_1',
      competenceId: 'competence_1',
      associatedSkillName: '@skillChallengeC_1',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_B_for_competence_1',
      competenceId: 'competence_1',
      associatedSkillName: '@skillChallengeB_1',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_D_for_competence_2',
      competenceId: 'competence_2',
      associatedSkillName: '@skillChallengeD_2',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_E_for_competence_2',
      competenceId: 'competence_2',
      associatedSkillName: '@skillChallengeE_2',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_F_for_competence_2',
      competenceId: 'competence_2',
      associatedSkillName: '@skillChallengeF_2',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_G_for_competence_3',
      competenceId: 'competence_3',
      associatedSkillName: '@skillChallengeG_3',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_H_for_competence_3',
      competenceId: 'competence_3',
      associatedSkillName: '@skillChallengeH_3',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_I_for_competence_3',
      competenceId: 'competence_3',
      associatedSkillName: '@skillChallengeI_3',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_J_for_competence_4',
      competenceId: 'competence_4',
      associatedSkillName: '@skillChallengeJ_4',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_K_for_competence_4',
      competenceId: 'competence_4',
      associatedSkillName: '@skillChallengeK_4',
      type: 'QCM',
    },
    {
      challengeId: 'challenge_L_for_competence_4',
      competenceId: 'competence_4',
      associatedSkillName: '@skillChallengeL_4',
      type: 'QCM',
    },
  ],
  domainBuilder.buildCertificationChallengeWithType,
);

const competence_1 = domainBuilder.buildCompetence({
  id: 'competence_1',
  index: '1.1',
  areaId: 'area1',
  name: 'Mener une recherche',
});
const competence_2 = domainBuilder.buildCompetence({
  id: 'competence_2',
  index: '2.2',
  areaId: 'area2',
  name: 'Partager',
});
const competence_3 = domainBuilder.buildCompetence({
  id: 'competence_3',
  index: '3.3',
  areaId: 'area3',
  name: 'Adapter',
});
const competence_4 = domainBuilder.buildCompetence({
  id: 'competence_4',
  index: '4.4',
  areaId: 'area4',
  name: 'Résoudre',
});
const competence_5 = domainBuilder.buildCompetence({
  id: 'competence_5',
  index: '5.5',
  areaId: 'area5',
  name: 'Chercher',
});
const competence_6 = domainBuilder.buildCompetence({
  id: 'competence_6',
  index: '6.6',
  areaId: 'area6',
  name: 'Trouver',
});

const userCompetences = [
  _buildUserCompetence(competence_1, pixForCompetence1, 1),
  _buildUserCompetence(competence_2, pixForCompetence2, 2),
  _buildUserCompetence(competence_3, pixForCompetence3, 3),
  _buildUserCompetence(competence_4, pixForCompetence4, 4),
];

describe('Certification | Shared | Unit | Domain | Services | Scoring V2', function () {
  context('#handleV2CertificationScoring', function () {
    let assessmentResultRepository,
      competenceMarkRepository,
      certificationCourseRepository,
      scoringCertificationService,
      dependencies;

    beforeEach(function () {
      competenceMarkRepository = { save: sinon.stub() };
      assessmentResultRepository = { save: sinon.stub() };
      certificationCourseRepository = { get: sinon.stub() };
      dependencies = { calculateCertificationAssessmentScore: sinon.stub() };
      scoringCertificationService = {
        isLackOfAnswersForTechnicalReason: sinon.stub(),
      };
    });

    context('for scoring certification', function () {
      context('when candidate has enough correct answers to be certified', function () {
        let certificationCourseId, certificationAssessmentScore, certificationAssessment, certificationCourse;

        beforeEach(function () {
          const assessmentResultId = 123123;
          certificationCourseId = 123;
          const competenceMark1 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 5 });
          const competenceMark2 = domainBuilder.buildCompetenceMark({ assessmentResultId, score: 4 });

          certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            competenceMarks: [competenceMark1, competenceMark2],
            percentageCorrectAnswers: 80,
          });
          certificationAssessment = domainBuilder.buildCertificationAssessment({
            id: 987,
            certificationCourseId,
            userId: 4567,
          });

          certificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourseId,
            completedAt: null,
          });
          const savedAssessmentResult = domainBuilder.certification.scoring.buildAssessmentResult.standard({
            id: assessmentResultId,
            pixScore: certificationAssessmentScore.nbPix,
            reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
            status: certificationAssessmentScore.status,
            assessmentId: certificationAssessment.id,
          });

          dependencies.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
          scoringCertificationService.isLackOfAnswersForTechnicalReason.returns(false);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save
            .withArgs({ certificationCourseId, assessmentResult: savedAssessmentResult })
            .resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();
        });

        it('builds and save an assessment result with the expected arguments', async function () {
          // when
          await handleV2CertificationScoring({
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
            dependencies,
          });

          // then
          const expectedAssessmentResult = new AssessmentResult({
            pixScore: certificationAssessmentScore.nbPix,
            reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
            status: certificationAssessmentScore.status,
            assessmentId: certificationAssessment.id,
          });
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId,
            assessmentResult: expectedAssessmentResult,
          });
        });

        it('builds and save as many competence marks as present in the certificationAssessmentScore', async function () {
          // when
          await handleV2CertificationScoring({
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
            dependencies,
          });

          // then
          expect(competenceMarkRepository.save.callCount).to.equal(certificationAssessmentScore.competenceMarks.length);
        });
      });

      context('when candidate has insufficient correct answers to be certified', function () {
        it('builds and save an insufficient correct answers assessment result', async function () {
          // given
          const certificationCourseId = 123;
          const certificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourseId,
            abortReason: null,
          });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            competenceMarks: [],
            percentageCorrectAnswers: 49,
            hasEnoughNonNeutralizedChallengesToBeTrusted: true,
          });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            id: 45674567,
            certificationCourseId,
            userId: 4567,
          });
          const savedAssessmentResult = { id: 123123 };

          dependencies.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
          scoringCertificationService.isLackOfAnswersForTechnicalReason.returns(false);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await handleV2CertificationScoring({
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
            dependencies,
          });

          // then
          const expectedAssessmentResult = new AssessmentResult({
            pixScore: 0,
            reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
            status: status.REJECTED,
            assessmentId: certificationAssessment.id,
            commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
              commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
            }),
            commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
              commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_INSUFFICIENT_CORRECT_ANSWERS,
            }),
          });

          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId: 123,
            assessmentResult: expectedAssessmentResult,
          });
        });
      });

      context('when certification is cancelled', function () {
        it('builds and save a cancelled assessment result', async function () {
          // given
          const certificationCourseId = 123;
          const juryId = 456;
          const event = new CertificationCancelled({ certificationCourseId, juryId });
          const certificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourseId,
            abortReason: null,
            isCancelled: true,
          });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            competenceMarks: [],
            percentageCorrectAnswers: 49,
            hasEnoughNonNeutralizedChallengesToBeTrusted: true,
          });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            id: 45674567,
            certificationCourseId,
            userId: 4567,
          });
          const savedAssessmentResult = { id: 123123 };

          dependencies.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
          scoringCertificationService.isLackOfAnswersForTechnicalReason.returns(false);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await handleV2CertificationScoring({
            event,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
            dependencies,
          });

          // then
          const expectedAssessmentResult = new AssessmentResult({
            pixScore: 0,
            reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
            status: AssessmentResult.status.CANCELLED,
            assessmentId: certificationAssessment.id,
            juryId,
          });

          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId: 123,
            assessmentResult: expectedAssessmentResult,
          });
        });
      });
    });

    context('for rescoring certification', function () {
      it('computes and persists the assessment result and competence marks', async function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          isCancelled: false,
        });

        const event = new ChallengeNeutralized({ certificationCourseId: certificationCourse.getId(), juryId: 7 });
        const certificationAssessment = new CertificationAssessment({
          id: 123,
          userId: 123,
          certificationCourseId: certificationCourse.getId(),
          createdAt: new Date('2020-01-01'),
          completedAt: new Date('2020-01-01'),
          state: CertificationAssessment.states.STARTED,
          version: 2,
          certificationChallenges: [
            domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
            domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          ],
          certificationAnswersByDate: ['answer'],
        });
        const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 5 });
        const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 4 });

        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          nbPix: 9,
          status: AssessmentResult.status.VALIDATED,
          competenceMarks: [competenceMark1, competenceMark2],
          percentageCorrectAnswers: 80,
          hasEnoughNonNeutralizedChallengesToBeTrusted: true,
        });

        const assessmentResultToBeSaved = new AssessmentResult({
          id: undefined,
          pixScore: 9,
          reproducibilityRate: 80,
          status: AssessmentResult.status.VALIDATED,
          assessmentId: 123,
          juryId: 7,
        });
        const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });
        assessmentResultRepository.save.resolves({
          certificationCourseId: 789,
          assessmentResult: savedAssessmentResult,
        });

        dependencies.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
        scoringCertificationService.isLackOfAnswersForTechnicalReason.returns(false);
        certificationCourseRepository.get
          .withArgs({ id: certificationAssessment.certificationCourseId })
          .resolves(certificationCourse);
        assessmentResultRepository.save.resolves(savedAssessmentResult);
        competenceMarkRepository.save.resolves();

        // when
        await handleV2CertificationScoring({
          event,
          certificationAssessment,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          scoringCertificationService,
          dependencies,
        });

        // then
        expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
          certificationCourseId: 123,
          assessmentResult: assessmentResultToBeSaved,
        });
        competenceMark1.assessmentResultId = savedAssessmentResult.id;
        competenceMark2.assessmentResultId = savedAssessmentResult.id;
        expect(competenceMarkRepository.save).to.have.been.calledWithExactly(competenceMark1);
        expect(competenceMarkRepository.save).to.have.been.calledWithExactly(competenceMark2);
      });

      context('when the certification has not enough non neutralized challenges to be trusted', function () {
        let certificationCourse, event, certificationAssessment;

        beforeEach(function () {
          certificationCourse = domainBuilder.buildCertificationCourse({ id: 789 });
          event = new ChallengeNeutralized({ certificationCourseId: 789, juryId: 7 });
          certificationAssessment = new CertificationAssessment({
            id: 123,
            userId: 123,
            certificationCourseId: 789,
            createdAt: new Date('2020-01-01'),
            completedAt: new Date('2020-01-01'),
            state: CertificationAssessment.states.STARTED,
            version: 2,
            certificationChallenges: [
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
            ],
            certificationAnswersByDate: ['answer'],
          });
        });

        it('builds and save a not trustable assessment result', async function () {
          // given
          const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 12 });
          const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 18 });

          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            status: AssessmentResult.status.VALIDATED,
            competenceMarks: [competenceMark1, competenceMark2],
            percentageCorrectAnswers: 80,
            hasEnoughNonNeutralizedChallengesToBeTrusted: false,
          });
          const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.notTrustable({
            pixScore: 30,
            reproducibilityRate: 80,
            assessmentId: 123,
            juryId: 7,
          });
          const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });

          assessmentResultRepository.save.resolves({
            certificationCourseId: 789,
            assessmentResult: savedAssessmentResult,
          });

          dependencies.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
          scoringCertificationService.isLackOfAnswersForTechnicalReason.returns(false);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await handleV2CertificationScoring({
            event,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
            dependencies,
          });

          // then
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId: 789,
            assessmentResult: assessmentResultToBeSaved,
          });
        });

        context('when it has insufficient correct answers', function () {
          it('builds and save a not trustable assessment result', async function () {
            // given
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
              status: AssessmentResult.status.REJECTED,
              percentageCorrectAnswers: 45,
              hasEnoughNonNeutralizedChallengesToBeTrusted: false,
            });
            const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.notTrustable({
              pixScore: 0,
              reproducibilityRate: 45,
              assessmentId: 123,
              juryId: 7,
            });
            const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });

            assessmentResultRepository.save.resolves({
              certificationCourseId: 789,
              assessmentResult: savedAssessmentResult,
            });
            dependencies.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
            scoringCertificationService.isLackOfAnswersForTechnicalReason.returns(false);
            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(certificationCourse);
            assessmentResultRepository.save.resolves(savedAssessmentResult);
            competenceMarkRepository.save.resolves();

            // when
            await handleV2CertificationScoring({
              event,
              certificationAssessment,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
              dependencies,
            });

            // then
            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 789,
              assessmentResult: assessmentResultToBeSaved,
            });
          });
        });
      });

      context('when the certification has enough non neutralized challenges to be trusted', function () {
        it('build and save a standard assessment result', async function () {
          // given
          const certificationCourse = domainBuilder.buildCertificationCourse({ id: 789, isCancelled: true });

          const event = new ChallengeNeutralized({ certificationCourseId: 789, juryId: 7 });
          const certificationAssessment = new CertificationAssessment({
            id: 123,
            userId: 123,
            certificationCourseId: 789,
            createdAt: new Date('2020-01-01'),
            completedAt: new Date('2020-01-01'),
            state: CertificationAssessment.states.STARTED,
            version: 2,
            certificationChallenges: [
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
              domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
            ],
            certificationAnswersByDate: ['answer'],
          });
          certificationCourseRepository.get.withArgs({ id: 789 }).resolves(certificationCourse);
          const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 12 });
          const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 18 });
          const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
            status: AssessmentResult.status.VALIDATED,
            competenceMarks: [competenceMark1, competenceMark2],
            percentageCorrectAnswers: 80,
            hasEnoughNonNeutralizedChallengesToBeTrusted: true,
          });
          const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.standard({
            pixScore: 30,
            reproducibilityRate: 80,
            status: AssessmentResult.status.VALIDATED,
            assessmentId: 123,
            juryId: 7,
          });
          const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });

          assessmentResultRepository.save.resolves({
            certificationCourseId: 789,
            assessmentResult: savedAssessmentResult,
          });

          dependencies.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
          scoringCertificationService.isLackOfAnswersForTechnicalReason.returns(false);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await handleV2CertificationScoring({
            event,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            scoringCertificationService,
            dependencies,
          });

          // then
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId: 789,
            assessmentResult: assessmentResultToBeSaved,
          });
        });
      });

      context('when the certification course is rejected', function () {
        context('when it is rejected for fraud', function () {
          it('builds and save a standard rejected assessment result ', async function () {
            // given
            const certificationCourse = domainBuilder.buildCertificationCourse({
              id: 789,
              isRejectedForFraud: true,
            });

            const event = new ChallengeNeutralized({ certificationCourseId: 789, juryId: 7 });
            const certificationAssessment = new CertificationAssessment({
              id: 123,
              userId: 123,
              certificationCourseId: 789,
              createdAt: new Date('2020-01-01'),
              completedAt: new Date('2020-01-01'),
              state: CertificationAssessment.states.STARTED,
              version: 2,
              certificationChallenges: [
                domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
                domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
              ],
              certificationAnswersByDate: ['answer'],
            });
            const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 12 });
            const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 18 });
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
              status: AssessmentResult.status.VALIDATED,
              competenceMarks: [competenceMark1, competenceMark2],
              percentageCorrectAnswers: 80,
              hasEnoughNonNeutralizedChallengesToBeTrusted: true,
            });

            const savedAssessmentResult = domainBuilder.certification.scoring.buildAssessmentResult.fraud({
              pixScore: 30,
              reproducibilityRate: 80,
              assessmentId: 123,
              juryId: 7,
            });
            assessmentResultRepository.save.resolves({
              certificationCourseId: 789,
              assessmentResult: savedAssessmentResult,
            });

            dependencies.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
            scoringCertificationService.isLackOfAnswersForTechnicalReason.returns(false);
            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(certificationCourse);
            competenceMarkRepository.save.resolves();

            // when
            await handleV2CertificationScoring({
              event,
              certificationAssessment,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
              dependencies,
            });

            // then
            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 789,
              assessmentResult: savedAssessmentResult,
            });
          });
        });

        context('when it is rejected for insufficient correct answers', function () {
          it('builds and save an insufficient correct answers assessment result', async function () {
            // given
            const certificationCourse = domainBuilder.buildCertificationCourse({
              id: 789,
            });

            const event = new ChallengeDeneutralized({ certificationCourseId: 789, juryId: 7 });
            const certificationAssessment = new CertificationAssessment({
              id: 123,
              userId: 123,
              certificationCourseId: 789,
              createdAt: new Date('2020-01-01'),
              completedAt: new Date('2020-01-01'),
              state: CertificationAssessment.states.ENDED_BY_SUPERVISOR,
              version: 2,
              certificationChallenges: [
                domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
                domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
                domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
              ],
              certificationAnswersByDate: ['answer'],
            });
            const competenceMark1 = domainBuilder.buildCompetenceMark({ score: 0 });
            const competenceMark2 = domainBuilder.buildCompetenceMark({ score: 0 });
            const competenceMark3 = domainBuilder.buildCompetenceMark({ score: 0 });
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
              competenceMarks: [competenceMark1, competenceMark2, competenceMark3],
              percentageCorrectAnswers: 33,
              hasEnoughNonNeutralizedChallengesToBeTrusted: true,
            });

            const assessmentResultToBeSaved =
              domainBuilder.certification.scoring.buildAssessmentResult.insufficientCorrectAnswers({
                pixScore: 0,
                reproducibilityRate: 33,
                assessmentId: 123,
                juryId: 7,
              });
            assessmentResultRepository.save.resolves({
              certificationCourseId: 789,
              assessmentResult: assessmentResultToBeSaved,
            });
            dependencies.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
            scoringCertificationService.isLackOfAnswersForTechnicalReason.returns(false);
            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(certificationCourse);
            competenceMarkRepository.save.resolves();

            // when
            await handleV2CertificationScoring({
              event,
              certificationAssessment,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              scoringCertificationService,
              dependencies,
            });

            // then
            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 789,
              assessmentResult: assessmentResultToBeSaved,
            });
          });

          context('when the candidate encountered a technical issue during certification', function () {
            it('builds and save an assessment result lacking answers for technical reason', async function () {
              // given
              const certificationCourse = domainBuilder.buildCertificationCourse({
                id: 789,
                abortReason: ABORT_REASONS.TECHNICAL,
              });

              const event = new ChallengeDeneutralized({ certificationCourseId: 789, juryId: 7 });
              const certificationAssessment = new CertificationAssessment({
                id: 123,
                userId: 123,
                certificationCourseId: 789,
                createdAt: new Date('2020-01-01'),
                completedAt: new Date('2020-01-01'),
                state: CertificationAssessment.states.ENDED_BY_SUPERVISOR,
                version: 2,
                certificationChallenges: [domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false })],
                certificationAnswersByDate: ['answer'],
              });
              const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
                percentageCorrectAnswers: 33,
                hasEnoughNonNeutralizedChallengesToBeTrusted: true,
              });

              const assessmentResultToBeSaved =
                domainBuilder.certification.scoring.buildAssessmentResult.lackOfAnswersForTechnicalReason({
                  pixScore: 0,
                  reproducibilityRate: 33,
                  assessmentId: 123,
                  juryId: 7,
                });

              assessmentResultRepository.save.resolves({
                certificationCourseId: 789,
                assessmentResult: assessmentResultToBeSaved,
              });
              dependencies.calculateCertificationAssessmentScore.resolves(certificationAssessmentScore);
              scoringCertificationService.isLackOfAnswersForTechnicalReason.returns(true);
              certificationCourseRepository.get
                .withArgs({ id: certificationAssessment.certificationCourseId })
                .resolves(certificationCourse);
              competenceMarkRepository.save.resolves();

              // when
              await handleV2CertificationScoring({
                event,
                certificationAssessment,
                assessmentResultRepository,
                certificationCourseRepository,
                competenceMarkRepository,
                scoringCertificationService,
                dependencies,
              });

              // then
              expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
                certificationCourseId: 789,
                assessmentResult: assessmentResultToBeSaved,
              });
            });
          });
        });
      });
    });
  });

  context('#calculateCertificationAssessmentScore', function () {
    let certificationAssessment, certificationAssessmentData, expectedCertifiedCompetences;
    let competenceWithMarks_1_1, competenceWithMarks_2_2, competenceWithMarks_3_3, competenceWithMarks_4_4;
    let areaRepository, certificationCandidateRepository;

    beforeEach(function () {
      areaRepository = {
        list: sinon.stub(),
      };
      certificationCandidateRepository = {
        findByAssessmentId: sinon.stub().throws('bad arguments'),
      };
      areaRepository.list.resolves(['1', '2', '3', '4', '5', '6'].map((code) => ({ id: `area${code}`, code })));
      certificationAssessmentData = {
        id: 1,
        userId: 11,
        certificationCourseId: 111,
        createdAt: '2020-02-01T00:00:00Z',
        completedAt: '2020-02-01T00:00:00Z',
        state: states.COMPLETED,
        version: 2,
      };
      competenceWithMarks_1_1 = domainBuilder.buildCompetenceMark({
        level: UNCERTIFIED_LEVEL,
        score: 0,
        area_code: '1',
        competence_code: '1.1',
        competenceId: 'competence_1',
      });
      competenceWithMarks_2_2 = domainBuilder.buildCompetenceMark({
        level: UNCERTIFIED_LEVEL,
        score: 0,
        area_code: '2',
        competence_code: '2.2',
        competenceId: 'competence_2',
      });
      competenceWithMarks_3_3 = domainBuilder.buildCompetenceMark({
        level: UNCERTIFIED_LEVEL,
        score: 0,
        area_code: '3',
        competence_code: '3.3',
        competenceId: 'competence_3',
      });
      competenceWithMarks_4_4 = domainBuilder.buildCompetenceMark({
        level: UNCERTIFIED_LEVEL,
        score: 0,
        area_code: '4',
        competence_code: '4.4',
        competenceId: 'competence_4',
      });
      expectedCertifiedCompetences = [
        competenceWithMarks_1_1,
        competenceWithMarks_2_2,
        competenceWithMarks_3_3,
        competenceWithMarks_4_4,
      ];
    });

    context('When at least one challenge have more than one answer ', function () {
      it('should throw', async function () {
        // given
        const certificationAnswersByDate = _.map(
          [
            { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_C_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_F_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_G_for_competence_3', result: 'ok' },
            { challengeId: 'challenge_H_for_competence_3', result: 'ok' },
            { challengeId: 'challenge_I_for_competence_3', result: 'ok' },
            { challengeId: 'challenge_J_for_competence_4', result: 'ok' },
            { challengeId: 'challenge_K_for_competence_4', result: 'ok' },
            { challengeId: 'challenge_K_for_competence_4', result: 'ok' },
            { challengeId: 'challenge_L_for_competence_4', result: 'ok' },
          ],
          domainBuilder.buildAnswer,
        );

        const certificationAssessment = {
          certificationAnswersByDate,
          certificationChallenges: challenges,
        };
        const candidate = domainBuilder.certification.evaluation.buildCandidate();

        const placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: candidate.reconciledAt,
            version: AlgorithmEngineVersion.V2,
          })
          .resolves({ userCompetences });
        certificationCandidateRepository.findByAssessmentId
          .withArgs({
            assessmentId: certificationAssessment.id,
          })
          .resolves(candidate);

        // when
        const error = await catchErr(calculateCertificationAssessmentScore)({
          certificationAssessment,
          areaRepository,
          placementProfileService,
          scoringService,
          certificationCandidateRepository,
        });

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Plusieurs réponses pour une même épreuve');
      });
    });

    context('When there are less answers than challenges', function () {
      it('should throw', async function () {
        // given
        const certificationAnswersByDate = _.map(
          [
            { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_C_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_F_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_G_for_competence_3', result: 'ok' },
            { challengeId: 'challenge_H_for_competence_3', result: 'ok' },
            { challengeId: 'challenge_I_for_competence_3', result: 'ok' },
            { challengeId: 'challenge_J_for_competence_4', result: 'ok' },
            { challengeId: 'challenge_K_for_competence_4', result: 'ok' },
          ],
          domainBuilder.buildAnswer,
        );

        const certificationAssessment = {
          certificationAnswersByDate,
          certificationChallenges: challenges,
        };
        const candidate = domainBuilder.certification.evaluation.buildCandidate();

        const placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: candidate.reconciledAt,
            version: AlgorithmEngineVersion.V2,
          })
          .resolves({ userCompetences });
        certificationCandidateRepository.findByAssessmentId
          .withArgs({
            assessmentId: certificationAssessment.id,
          })
          .resolves(candidate);

        // when
        const error = await catchErr(calculateCertificationAssessmentScore)({
          candidate,
          certificationAssessment,
          areaRepository,
          placementProfileService,
          scoringService,
          certificationCandidateRepository,
        });

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal(
          "L’utilisateur n’a pas répondu à toutes les questions, alors qu'aucune raison d'abandon n'a été fournie.",
        );
      });
    });

    context('When there is no challenge for a competence ', function () {
      it('should throw', async function () {
        // given
        const certificationAnswersByDate = _.map(
          [
            { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_C_for_competence_1', result: 'ok' },
            { challengeId: 'challenge_D_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_E_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_F_for_competence_2', result: 'ok' },
            { challengeId: 'challenge_G_for_competence_3', result: 'ok' },
            { challengeId: 'challenge_H_for_competence_3', result: 'ok' },
            { challengeId: 'challenge_I_for_competence_3', result: 'ok' },
            { challengeId: 'challenge_J_for_competence_4', result: 'ok' },
            { challengeId: 'challenge_K_for_competence_4', result: 'ok' },
          ],
          domainBuilder.buildAnswer,
        );

        const challenges = _.map(
          [
            {
              challengeId: 'challenge_A_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeA_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_C_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeC_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_B_for_competence_1',
              competenceId: 'competence_1',
              associatedSkillName: '@skillChallengeB_1',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_D_for_competence_2',
              competenceId: 'competence_2',
              associatedSkillName: '@skillChallengeD_2',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_E_for_competence_2',
              competenceId: 'competence_2',
              associatedSkillName: '@skillChallengeE_2',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_F_for_competence_2',
              competenceId: 'competence_2',
              associatedSkillName: '@skillChallengeF_2',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_G_for_competence_3',
              competenceId: 'competence_3',
              associatedSkillName: '@skillChallengeG_3',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_H_for_competence_3',
              competenceId: 'competence_3',
              associatedSkillName: '@skillChallengeH_3',
              type: 'QCM',
            },
            {
              challengeId: 'challenge_I_for_competence_3',
              competenceId: 'competence_3',
              associatedSkillName: '@skillChallengeI_3',
              type: 'QCM',
            },
          ],
          domainBuilder.buildCertificationChallengeWithType,
        );

        const certificationAssessment = {
          certificationAnswersByDate,
          certificationChallenges: challenges,
        };
        const candidate = domainBuilder.certification.evaluation.buildCandidate();

        const placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: candidate.reconciledAt,
            version: AlgorithmEngineVersion.V2,
          })
          .resolves({ userCompetences });
        certificationCandidateRepository.findByAssessmentId
          .withArgs({
            assessmentId: certificationAssessment.id,
          })
          .resolves(candidate);

        // when
        const error = await catchErr(calculateCertificationAssessmentScore)({
          candidate,
          certificationAssessment,
          areaRepository,
          placementProfileService,
          scoringService,
          certificationCandidateRepository,
        });

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Pas assez de challenges posés pour la compétence 4.4');
      });
    });

    context('Compute certification result for jury', function () {
      let placementProfileService;
      beforeEach(function () {
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          ...certificationAssessmentData,
          certificationAnswersByDate: wrongAnswersForAllChallenges(),
          certificationChallenges: challenges,
        });
        const candidate = domainBuilder.certification.evaluation.buildCandidate();

        placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: candidate.reconciledAt,
            version: AlgorithmEngineVersion.V2,
          })
          .resolves({ userCompetences });
        certificationCandidateRepository.findByAssessmentId
          .withArgs({
            assessmentId: certificationAssessment.id,
          })
          .resolves(candidate);
      });

      it('should get user profile', async function () {
        // when
        await calculateCertificationAssessmentScore({
          certificationAssessment,
          areaRepository,
          placementProfileService,
          scoringService,
          certificationCandidateRepository,
        });

        // then
        sinon.assert.calledOnce(placementProfileService.getPlacementProfile);
      });

      context('when assessment is just started', function () {
        let startedCertificationAssessment;

        beforeEach(function () {
          startedCertificationAssessment = domainBuilder.buildCertificationAssessment({
            ...certificationAssessment,
            completedAt: null,
            state: states.STARTED,
          });
        });

        it('should return list of competences with all certifiedLevel at -1', async function () {
          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment: startedCertificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is < 50%', function () {
        it('should return list of competences with all certifiedLevel at -1', async function () {
          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is between 80% and 100%', function () {
        beforeEach(function () {
          certificationAssessment.certificationAnswersByDate = correctAnswersForAllChallenges();
        });

        it('should return list of competences with all certifiedLevel equal to estimatedLevel', async function () {
          // given
          const expectedCertifiedCompetences = [
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_1_1,
              level: 1,
              score: pixForCompetence1,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_2_2,
              level: 2,
              score: pixForCompetence2,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_3_3,
              level: 3,
              score: pixForCompetence3,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_4_4,
              level: 4,
              score: pixForCompetence4,
            }),
          ];

          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });

        it('should return list of competences with certifiedLevel = estimatedLevel except for failed competence', async function () {
          // given
          certificationAssessment.certificationAnswersByDate = answersToHaveOnlyTheLastCompetenceFailed();
          const expectedCertifiedCompetences = [
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_1_1,
              level: 1,
              score: pixForCompetence1,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_2_2,
              level: 2,
              score: pixForCompetence2,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_3_3,
              level: 3,
              score: pixForCompetence3,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_4_4,
            }),
          ];

          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is between 50% and 80%', function () {
        beforeEach(function () {
          certificationAssessment.certificationAnswersByDate = answersWithReproducibilityRateLessThan80();
        });

        it('should return list of competences with certifiedLevel less or equal to estimatedLevel', async function () {
          // given
          const malusForFalseAnswer = 8;
          const expectedCertifiedCompetences = [
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_1_1,
              level: 0,
              score: pixForCompetence1 - malusForFalseAnswer,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_2_2,
              level: 2,
              score: pixForCompetence2,
            }),
            competenceWithMarks_3_3,
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_4_4,
              level: 3,
              score: pixForCompetence4 - malusForFalseAnswer,
            }),
          ];

          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });

        it('should return the percentage of correct answers', async function () {
          // given
          const certificationAssessmentWithNeutralizedChallenge = _.cloneDeep(certificationAssessment);
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[0].isNeutralized = true;

          // when
          const { percentageCorrectAnswers } = await calculateCertificationAssessmentScore({
            certificationAssessment: certificationAssessmentWithNeutralizedChallenge,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(percentageCorrectAnswers).to.deep.equal(64);
        });

        context('when one competence is evaluated with 3 challenges', function () {
          let placementProfileService;
          context('with one OK, one KO and one QROCM-dep OK', function () {
            it('should return level obtained equal to level positioned minus one', async function () {
              // Given
              const positionedLevel = 2;
              const positionedScore = 20;

              const answers = _.map(
                [
                  { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
                  { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
                  { challengeId: 'challenge_C_for_competence_1', result: 'ko' },
                ],
                domainBuilder.buildAnswer,
              );

              const challenges = _.map(
                [
                  {
                    challengeId: 'challenge_A_for_competence_1',
                    competenceId: 'competence_1',
                    associatedSkillName: '@skillChallengeA_1',
                  },
                  {
                    challengeId: 'challenge_B_for_competence_1',
                    competenceId: 'competence_1',
                    associatedSkillName: '@skillChallengeB_1',
                  },
                  {
                    challengeId: 'challenge_C_for_competence_1',
                    competenceId: 'competence_1',
                    associatedSkillName: '@skillChallengeC_1',
                  },
                ],
                domainBuilder.buildCertificationChallengeWithType,
              );

              const userCompetences = [_buildUserCompetence(competence_1, positionedScore, positionedLevel)];

              certificationAssessment.certificationAnswersByDate = answers;
              certificationAssessment.certificationChallenges = challenges;
              placementProfileService = {
                getPlacementProfile: sinon.stub(),
              };
              const candidate = domainBuilder.certification.evaluation.buildCandidate();
              certificationCandidateRepository.findByAssessmentId
                .withArgs({
                  assessmentId: certificationAssessment.id,
                })
                .resolves(candidate);
              placementProfileService.getPlacementProfile
                .withArgs({
                  userId: certificationAssessment.userId,
                  limitDate: candidate.reconciledAt,
                  version: AlgorithmEngineVersion.V2,
                })
                .resolves({ userCompetences });

              // When
              const certificationAssessmentScore = await calculateCertificationAssessmentScore({
                certificationAssessment,
                areaRepository,
                placementProfileService,
                scoringService,
                certificationCandidateRepository,
              });

              // Then
              expect(certificationAssessmentScore.competenceMarks[0].level).to.deep.equal(positionedLevel - 1);
              expect(certificationAssessmentScore.competenceMarks[0].score).to.deep.equal(positionedScore - 8);
            });
          });
        });
      });
    });

    context('Calculate certification result when assessment is completed (stop on error)', function () {
      let placementProfileService;
      beforeEach(function () {
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          ...certificationAssessmentData,
          certificationAnswersByDate: wrongAnswersForAllChallenges(),
          certificationChallenges: challenges,
        });
        const candidate = domainBuilder.certification.evaluation.buildCandidate();
        placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        certificationCandidateRepository = {
          findByAssessmentId: sinon
            .stub()
            .withArgs({
              assessmentId: certificationAssessment.id,
            })
            .resolves(candidate),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: candidate.reconciledAt,
            version: AlgorithmEngineVersion.V2,
          })
          .resolves({ userCompetences });
      });

      context('when reproducibility rate is < 50%', function () {
        it('should return list of competences with all certifiedLevel at -1', async function () {
          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is between 80% and 100%', function () {
        beforeEach(function () {
          certificationAssessment.certificationAnswersByDate = correctAnswersForAllChallenges();
        });

        it('should return list of competences with all certifiedLevel equal to estimatedLevel', async function () {
          // given
          const expectedCertifiedCompetences = [
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_1_1,
              level: 1,
              score: pixForCompetence1,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_2_2,
              level: 2,
              score: pixForCompetence2,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_3_3,
              level: 3,
              score: pixForCompetence3,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_4_4,
              level: 4,
              score: pixForCompetence4,
            }),
          ];

          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });

        it('should return list of competences with certifiedLevel = estimatedLevel except for failed competence', async function () {
          // given
          certificationAssessment.certificationAnswersByDate = answersToHaveOnlyTheLastCompetenceFailed();
          const expectedCertifiedCompetences = [
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_1_1,
              level: 1,
              score: pixForCompetence1,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_2_2,
              level: 2,
              score: pixForCompetence2,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_3_3,
              level: 3,
              score: pixForCompetence3,
            }),
            competenceWithMarks_4_4,
          ];

          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is between 50% and 80%', function () {
        beforeEach(function () {
          certificationAssessment.certificationAnswersByDate = answersWithReproducibilityRateLessThan80();
        });

        it('should return list of competences with certifiedLevel less or equal to estimatedLevel', async function () {
          // given
          const malusForFalseAnswer = 8;
          const expectedCertifiedCompetences = [
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_1_1,
              level: 0,
              score: pixForCompetence1 - malusForFalseAnswer,
            }),
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_2_2,
              level: 2,
              score: pixForCompetence2,
            }),
            competenceWithMarks_3_3,
            domainBuilder.buildCompetenceMark({
              ...competenceWithMarks_4_4,
              level: 3,
              score: pixForCompetence4 - malusForFalseAnswer,
            }),
          ];

          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when only one challenge is asked for a competence', function () {
        let placementProfileService, certificationCandidateRepository;
        it('certifies a level below the estimated one if reproducibility rate is < 70%', async function () {
          // given
          const userCompetences = [
            _buildUserCompetence(competence_5, 50, 5),
            _buildUserCompetence(competence_6, 36, 3),
          ];
          certificationAssessment.certificationChallenges = _.map(
            [
              {
                challengeId: 'challenge_A_for_competence_5',
                competenceId: 'competence_5',
                associatedSkillName: '@skillChallengeA_5',
              },
              {
                challengeId: 'challenge_A_for_competence_6',
                competenceId: 'competence_6',
                associatedSkillName: '@skillChallengeA_6',
              },
              {
                challengeId: 'challenge_B_for_competence_6',
                competenceId: 'competence_6',
                associatedSkillName: '@skillChallengeB_6',
              },
              {
                challengeId: 'challenge_C_for_competence_6',
                competenceId: 'competence_6',
                associatedSkillName: '@skillChallengeC_6',
              },
            ],
            domainBuilder.buildCertificationChallengeWithType,
          );

          placementProfileService = {
            getPlacementProfile: sinon.stub(),
          };
          const candidate = domainBuilder.certification.evaluation.buildCandidate();
          certificationCandidateRepository = {
            findByAssessmentId: sinon
              .stub()
              .withArgs({
                assessmentId: certificationAssessment.id,
              })
              .resolves(candidate),
          };
          placementProfileService.getPlacementProfile
            .withArgs({
              userId: certificationAssessment.userId,
              limitDate: candidate.reconciledAt,
              version: AlgorithmEngineVersion.V2,
            })
            .resolves({ userCompetences });
          certificationAssessment.certificationAnswersByDate = _.map(
            [
              { challengeId: 'challenge_A_for_competence_5', result: 'ok' },
              { challengeId: 'challenge_A_for_competence_6', result: 'ko' },
              { challengeId: 'challenge_B_for_competence_6', result: 'ok' },
              { challengeId: 'challenge_C_for_competence_6', result: 'ko' },
            ],
            domainBuilder.buildAnswer,
          );

          const expectedCertifiedCompetences = [
            domainBuilder.buildCompetenceMark({
              competence_code: '5.5',
              area_code: '5',
              competenceId: 'competence_5',
              level: 4,
              score: 40,
            }),
            domainBuilder.buildCompetenceMark({
              competence_code: '6.6',
              area_code: '6',
              competenceId: 'competence_6',
              level: UNCERTIFIED_LEVEL,
              score: 0,
            }),
          ];

          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when challenges contains one QROCM-dep challenge to validate two skills', function () {
        let placementProfileService, certificationCandidateRepository;
        beforeEach(function () {
          const userCompetences = [
            _buildUserCompetence(competence_5, 50, 5),
            _buildUserCompetence(competence_6, 36, 3),
          ];

          certificationAssessment.certificationChallenges = _.map(
            [
              {
                challengeId: 'challenge_A_for_competence_5',
                competenceId: 'competence_5',
                associatedSkillName: '@skillChallengeA_5',
                type: 'QCM',
              },
              {
                challengeId: 'challenge_B_for_competence_5',
                competenceId: 'competence_5',
                associatedSkillName: '@skillChallengeB_5',
                type: 'QROCM-dep',
              },
              {
                challengeId: 'challenge_A_for_competence_6',
                competenceId: 'competence_6',
                associatedSkillName: '@skillChallengeA_6',
                type: 'QCM',
              },
              {
                challengeId: 'challenge_B_for_competence_6',
                competenceId: 'competence_6',
                associatedSkillName: '@skillChallengeB_6',
                type: 'QCM',
              },
              {
                challengeId: 'challenge_C_for_competence_6',
                competenceId: 'competence_6',
                associatedSkillName: '@skillChallengeC_6',
                type: 'QCM',
              },
            ],
            domainBuilder.buildCertificationChallengeWithType,
          );

          const candidate = domainBuilder.certification.evaluation.buildCandidate();
          certificationCandidateRepository = {
            findByAssessmentId: sinon
              .stub()
              .withArgs({
                assessmentId: certificationAssessment.id,
              })
              .resolves(candidate),
          };

          placementProfileService = {
            getPlacementProfile: sinon.stub(),
          };
          placementProfileService.getPlacementProfile
            .withArgs({
              userId: certificationAssessment.userId,
              limitDate: candidate.reconciledAt,
              version: AlgorithmEngineVersion.V2,
            })
            .resolves({ userCompetences });
        });

        it('should compute the result as if QROCM-dep was two OK challenges', async function () {
          // given
          certificationAssessment.certificationAnswersByDate = _.map(
            [
              { challengeId: 'challenge_A_for_competence_5', result: 'ok' },
              { challengeId: 'challenge_B_for_competence_5', result: 'ok' },
              { challengeId: 'challenge_A_for_competence_6', result: 'ko' },
              { challengeId: 'challenge_B_for_competence_6', result: 'ok' },
              { challengeId: 'challenge_C_for_competence_6', result: 'ko' },
            ],
            domainBuilder.buildAnswer,
          );

          const expectedCertifiedCompetences = [
            domainBuilder.buildCompetenceMark({
              competence_code: '5.5',
              area_code: '5',
              competenceId: 'competence_5',
              level: 5,
              score: 40,
            }),
            domainBuilder.buildCompetenceMark({
              competence_code: '6.6',
              area_code: '6',
              competenceId: 'competence_6',
              level: UNCERTIFIED_LEVEL,
              score: 0,
            }),
          ];

          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when there are challenges for non-certifiable competences', function () {
        let challenges;

        beforeEach(function () {
          challenges = _.map(
            [
              {
                challengeId: 'challenge_A_for_competence_1',
                competenceId: 'competence_1',
                associatedSkillName: '@skillChallengeA_1',
              },
              {
                challengeId: 'challenge_M_for_competence_5',
                competenceId: 'competence_5',
                associatedSkillName: '@skillChallengeM_5',
              },
              {
                challengeId: 'challenge_N_for_competence_6',
                competenceId: 'competence_6',
                associatedSkillName: '@skillChallengeN_6',
              },
            ],
            domainBuilder.buildCertificationChallengeWithType,
          );
          certificationAssessment.certificationChallenges = challenges;

          certificationAssessment.certificationAnswersByDate = _.map(
            [
              { challengeId: 'challenge_A_for_competence_1', result: 'ko' },

              { challengeId: 'challenge_M_for_competence_5', result: 'ok' },
              { challengeId: 'challenge_N_for_competence_6', result: 'ok' },
            ],
            domainBuilder.buildAnswer,
          );
        });

        it('should not include the extra challenges when computing reproducibility', async function () {
          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.percentageCorrectAnswers).to.equal(0);
        });
      });
    });

    context('non neutralization rate trustability', function () {
      let placementProfileService, certificationCandidateRepository;

      beforeEach(function () {
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          ...certificationAssessmentData,
          certificationAnswersByDate: wrongAnswersForAllChallenges(),
          certificationChallenges: challenges,
        });
        certificationAssessment.certificationAnswersByDate = correctAnswersForAllChallenges();
        const candidate = domainBuilder.certification.evaluation.buildCandidate();
        placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        certificationCandidateRepository = {
          findByAssessmentId: sinon
            .stub()
            .withArgs({
              assessmentId: certificationAssessment.id,
            })
            .resolves(candidate),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: candidate.reconciledAt,
            version: AlgorithmEngineVersion.V2,
          })
          .resolves({ userCompetences });
      });

      context('when certification has enough non neutralized challenges to be trusted', function () {
        it('should return a CertificationAssessmentScore which hasEnoughNonNeutralizedChallengesToBeTrusted is true', async function () {
          // given
          const certificationAssessmentWithNeutralizedChallenge = _.cloneDeep(certificationAssessment);
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[0].isNeutralized = true;
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[1].isNeutralized = true;
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[2].isNeutralized = true;
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[3].isNeutralized = true;

          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment: certificationAssessmentWithNeutralizedChallenge,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted).to.be.true;
        });
      });

      context('when certification has not enough non neutralized challenges to be trusted', function () {
        it('should return a CertificationAssessmentScore which hasEnoughNonNeutralizedChallengesToBeTrusted is false', async function () {
          // given
          const certificationAssessmentWithNeutralizedChallenge = _.cloneDeep(certificationAssessment);
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[0].isNeutralized = true;
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[1].isNeutralized = true;
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[2].isNeutralized = true;
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[3].isNeutralized = true;
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[4].isNeutralized = true;
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[5].isNeutralized = true;

          // when
          const certificationAssessmentScore = await calculateCertificationAssessmentScore({
            certificationAssessment: certificationAssessmentWithNeutralizedChallenge,
            areaRepository,
            placementProfileService,
            scoringService,
            certificationCandidateRepository,
          });

          // then
          expect(certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted).to.be.false;
        });
      });
    });
  });
});
