import _ from 'lodash';

import { CertificationComputeError } from '../../../../../lib/domain/errors.js';
import { AssessmentCompleted } from '../../../../../lib/domain/events/AssessmentCompleted.js';
import { CertificationCourseRejected } from '../../../../../lib/domain/events/CertificationCourseRejected.js';
import { CertificationJuryDone } from '../../../../../lib/domain/events/CertificationJuryDone.js';
import { ChallengeDeneutralized } from '../../../../../lib/domain/events/ChallengeDeneutralized.js';
import { ChallengeNeutralized } from '../../../../../lib/domain/events/ChallengeNeutralized.js';
import { CertificationAssessment, states } from '../../../../../lib/domain/models/CertificationAssessment.js';
import { CertificationCourse, CertificationResult } from '../../../../../lib/domain/models/index.js';
import * as scoringCertificationService from '../../../../../lib/domain/services/scoring/scoring-certification-service.js';
import { CertificationChallengeForScoring } from '../../../../../src/certification/scoring/domain/models/CertificationChallengeForScoring.js';
import { ABORT_REASONS } from '../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { CertificationVersion } from '../../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';
import { config } from '../../../../../src/shared/config.js';
import { AssessmentResult, status } from '../../../../../src/shared/domain/models/AssessmentResult.js';
import {
  generateAnswersForChallenges,
  generateChallengeList,
} from '../../../../certification/shared/fixtures/challenges.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

const { minimumAnswersRequiredToValidateACertification } = config.v3Certification.scoring;

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
const maximumAssessmentLength = 32;

describe('Unit | Service | Certification Result Service', function () {
  context('#calculateCertificationAssessmentScore', function () {
    let certificationAssessment, certificationAssessmentData, expectedCertifiedCompetences;
    let competenceWithMarks_1_1, competenceWithMarks_2_2, competenceWithMarks_3_3, competenceWithMarks_4_4;
    let areaRepository;

    beforeEach(function () {
      areaRepository = {
        list: sinon.stub(),
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

        const placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            version: 2,
          })
          .resolves({ userCompetences });

        // when
        const error = await catchErr(scoringCertificationService.calculateCertificationAssessmentScore)({
          certificationAssessment,
          continueOnError: false,
          dependencies: {
            areaRepository,
            placementProfileService,
          },
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

        const placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            version: 2,
          })
          .resolves({ userCompetences });

        // when
        const error = await catchErr(scoringCertificationService.calculateCertificationAssessmentScore)({
          certificationAssessment,
          continueOnError: false,
          dependencies: {
            areaRepository,
            placementProfileService,
          },
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

        const placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            version: 2,
          })
          .resolves({ userCompetences });

        // when
        const error = await catchErr(scoringCertificationService.calculateCertificationAssessmentScore)({
          certificationAssessment,
          continueOnError: false,
          dependencies: {
            areaRepository,
            placementProfileService,
          },
        });

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Pas assez de challenges posés pour la compétence 4.4');
      });
    });

    context('Compute certification result for jury (continue on error)', function () {
      const continueOnError = true;
      let placementProfileService;
      beforeEach(function () {
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          ...certificationAssessmentData,
          certificationAnswersByDate: wrongAnswersForAllChallenges(),
          certificationChallenges: challenges,
        });

        placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            version: 2,
          })
          .resolves({ userCompetences });
      });

      it('should get user profile', async function () {
        // when
        await scoringCertificationService.calculateCertificationAssessmentScore({
          certificationAssessment,
          continueOnError,
          dependencies: {
            areaRepository,
            placementProfileService,
          },
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment: startedCertificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is < 50%', function () {
        it('should return list of competences with all certifiedLevel at -1', async function () {
          // when
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });

        it('should return the percentage of correct answers', async function () {
          // given
          const certificationAssessmentWithNeutralizedChallenge = _.cloneDeep(certificationAssessment);
          certificationAssessmentWithNeutralizedChallenge.certificationChallenges[0].isNeutralized = true;

          // when
          const { percentageCorrectAnswers } = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment: certificationAssessmentWithNeutralizedChallenge,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
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
              placementProfileService.getPlacementProfile
                .withArgs({
                  userId: certificationAssessment.userId,
                  limitDate: certificationAssessment.createdAt,
                  version: certificationAssessment.version,
                })
                .resolves({ userCompetences });

              // When
              const certificationAssessmentScore =
                await scoringCertificationService.calculateCertificationAssessmentScore({
                  certificationAssessment,
                  continueOnError,
                  dependencies: {
                    areaRepository,
                    placementProfileService,
                  },
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
      const continueOnError = false;
      let placementProfileService;
      beforeEach(function () {
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          ...certificationAssessmentData,
          certificationAnswersByDate: wrongAnswersForAllChallenges(),
          certificationChallenges: challenges,
        });
        placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            version: certificationAssessment.version,
          })
          .resolves({ userCompetences });
      });

      context('when reproducibility rate is < 50%', function () {
        it('should return list of competences with all certifiedLevel at -1', async function () {
          // when
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when only one challenge is asked for a competence', function () {
        let placementProfileService;
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
          placementProfileService.getPlacementProfile
            .withArgs({
              userId: certificationAssessment.userId,
              limitDate: certificationAssessment.createdAt,
              version: certificationAssessment.version,
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when challenges contains one QROCM-dep challenge to validate two skills', function () {
        let placementProfileService;
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

          placementProfileService = {
            getPlacementProfile: sinon.stub(),
          };
          placementProfileService.getPlacementProfile
            .withArgs({
              userId: certificationAssessment.userId,
              limitDate: certificationAssessment.createdAt,
              version: certificationAssessment.version,
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });

        it('should compute the result of QROCM-dep as only one OK because result is partially right', async function () {
          // given
          certificationAssessment.certificationAnswersByDate = _.map(
            [
              { challengeId: 'challenge_A_for_competence_5', result: 'ok' },
              { challengeId: 'challenge_B_for_competence_5', result: 'partially' },
              { challengeId: 'challenge_A_for_competence_6', result: 'ko' },
              { challengeId: 'challenge_B_for_competence_6', result: 'ok' },
              { challengeId: 'challenge_C_for_competence_6', result: 'ok' },
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
              level: 2,
              score: 28,
            }),
          ];

          // when
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
          });

          // then
          expect(certificationAssessmentScore.percentageCorrectAnswers).to.equal(0);
        });
      });
    });

    context('non neutralization rate trustability', function () {
      let placementProfileService;

      beforeEach(function () {
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          ...certificationAssessmentData,
          certificationAnswersByDate: wrongAnswersForAllChallenges(),
          certificationChallenges: challenges,
        });
        certificationAssessment.certificationAnswersByDate = correctAnswersForAllChallenges();
        placementProfileService = {
          getPlacementProfile: sinon.stub(),
        };
        placementProfileService.getPlacementProfile
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            version: certificationAssessment.version,
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment: certificationAssessmentWithNeutralizedChallenge,
            continueOnError: false,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
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
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment: certificationAssessmentWithNeutralizedChallenge,
            continueOnError: false,
            dependencies: {
              areaRepository,
              placementProfileService,
            },
          });

          // then
          expect(certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted).to.be.false;
        });
      });
    });
  });

  context('#isLackOfAnswersForTechnicalReason', function () {
    context('when the certification stopped due to technical issue and has insufficient correct answers', function () {
      it('should return true', async function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: 178,
          abortReason: ABORT_REASONS.TECHNICAL,
        });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          percentageCorrectAnswers: 30,
        });

        // when
        const result = await scoringCertificationService.isLackOfAnswersForTechnicalReason({
          certificationCourse,
          certificationAssessmentScore,
        });

        // then
        expect(result).to.be.true;
      });
    });

    context('when the certification is successful', function () {
      it('should return false', async function () {
        // given
        const certificationCourse = domainBuilder.buildCertificationCourse({
          id: 178,
          abortReason: null,
        });
        const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScore({
          percentageCorrectAnswers: 80,
        });

        // when
        const result = await scoringCertificationService.isLackOfAnswersForTechnicalReason({
          certificationCourse,
          certificationAssessmentScore,
        });

        // then
        expect(result).to.be.false;
      });
    });
  });

  context('#handleV2CertificationScoring', function () {
    let assessmentResultRepository,
      competenceMarkRepository,
      certificationCourseRepository,
      calculateCertificationAssessmentScoreInjected;

    beforeEach(function () {
      competenceMarkRepository = { save: sinon.stub() };
      assessmentResultRepository = { save: sinon.stub() };
      certificationCourseRepository = { get: sinon.stub() };
      calculateCertificationAssessmentScoreInjected = sinon.stub();
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
            emitter: AssessmentResult.emitters.PIX_ALGO,
            pixScore: certificationAssessmentScore.nbPix,
            reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
            status: certificationAssessmentScore.status,
            assessmentId: certificationAssessment.id,
          });

          calculateCertificationAssessmentScoreInjected.resolves(certificationAssessmentScore);
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
          await scoringCertificationService.handleV2CertificationScoring({
            emitter: AssessmentResult.emitters.PIX_ALGO,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            calculateCertificationAssessmentScoreInjected,
          });

          // then
          const expectedAssessmentResult = new AssessmentResult({
            pixScore: certificationAssessmentScore.nbPix,
            reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
            status: certificationAssessmentScore.status,
            assessmentId: certificationAssessment.id,
            emitter: AssessmentResult.emitters.PIX_ALGO,
          });
          expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
            certificationCourseId,
            assessmentResult: expectedAssessmentResult,
          });
        });

        it('builds and save as many competence marks as present in the certificationAssessmentScore', async function () {
          // when
          await scoringCertificationService.handleV2CertificationScoring({
            emitter: AssessmentResult.emitters.PIX_ALGO,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            calculateCertificationAssessmentScoreInjected,
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

          calculateCertificationAssessmentScoreInjected.resolves(certificationAssessmentScore);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await scoringCertificationService.handleV2CertificationScoring({
            emitter: AssessmentResult.emitters.PIX_ALGO,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            calculateCertificationAssessmentScoreInjected,
          });

          // then
          const expectedAssessmentResult = new AssessmentResult({
            pixScore: 0,
            reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
            status: status.REJECTED,
            assessmentId: certificationAssessment.id,
            emitter: AssessmentResult.emitters.PIX_ALGO,
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

      context('when the certification stopped due to technical issue with insufficient correct answers', function () {
        it('builds and save an insufficient correct answers for technical reason assessment result', async function () {
          // given
          const certificationCourseId = 123;
          const certificationCourse = domainBuilder.buildCertificationCourse({
            id: certificationCourseId,
            abortReason: ABORT_REASONS.TECHNICAL,
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

          calculateCertificationAssessmentScoreInjected.resolves(certificationAssessmentScore);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await scoringCertificationService.handleV2CertificationScoring({
            emitter: AssessmentResult.emitters.PIX_ALGO,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            calculateCertificationAssessmentScoreInjected,
          });

          // then
          const expectedAssessmentResult = new AssessmentResult({
            pixScore: 0,
            reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
            status: status.REJECTED,
            assessmentId: certificationAssessment.id,
            emitter: AssessmentResult.emitters.PIX_ALGO,
            commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
              commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
            }),
            commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
              commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
            }),
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
          emitter: 'PIX-ALGO-NEUTRALIZATION',
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

        calculateCertificationAssessmentScoreInjected.resolves(certificationAssessmentScore);
        certificationCourseRepository.get
          .withArgs({ id: certificationAssessment.certificationCourseId })
          .resolves(certificationCourse);
        assessmentResultRepository.save.resolves(savedAssessmentResult);
        competenceMarkRepository.save.resolves();

        // when
        await scoringCertificationService.handleV2CertificationScoring({
          event,
          emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
          certificationAssessment,
          assessmentResultRepository,
          certificationCourseRepository,
          competenceMarkRepository,
          calculateCertificationAssessmentScoreInjected,
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
            emitter: 'PIX-ALGO-NEUTRALIZATION',
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
          calculateCertificationAssessmentScoreInjected.resolves(certificationAssessmentScore);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await scoringCertificationService.handleV2CertificationScoring({
            event,
            emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            calculateCertificationAssessmentScoreInjected,
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
              emitter: 'PIX-ALGO-NEUTRALIZATION',
              pixScore: 0,
              reproducibilityRate: 45,
              status: AssessmentResult.status.REJECTED,
              assessmentId: 123,
              juryId: 7,
            });
            const savedAssessmentResult = new AssessmentResult({ ...assessmentResultToBeSaved, id: 4 });

            assessmentResultRepository.save.resolves({
              certificationCourseId: 789,
              assessmentResult: savedAssessmentResult,
            });
            calculateCertificationAssessmentScoreInjected.resolves(certificationAssessmentScore);
            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(certificationCourse);
            assessmentResultRepository.save.resolves(savedAssessmentResult);
            competenceMarkRepository.save.resolves();

            // when
            await scoringCertificationService.handleV2CertificationScoring({
              event,
              emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
              certificationAssessment,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              calculateCertificationAssessmentScoreInjected,
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
            emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
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
          calculateCertificationAssessmentScoreInjected.resolves(certificationAssessmentScore);
          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(certificationCourse);
          assessmentResultRepository.save.resolves(savedAssessmentResult);
          competenceMarkRepository.save.resolves();

          // when
          await scoringCertificationService.handleV2CertificationScoring({
            event,
            emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
            certificationAssessment,
            assessmentResultRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            calculateCertificationAssessmentScoreInjected,
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
            calculateCertificationAssessmentScoreInjected.resolves(certificationAssessmentScore);
            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(certificationCourse);
            competenceMarkRepository.save.resolves();

            // when
            await scoringCertificationService.handleV2CertificationScoring({
              event,
              emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
              certificationAssessment,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              calculateCertificationAssessmentScoreInjected,
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
                emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
                juryId: 7,
              });
            assessmentResultRepository.save.resolves({
              certificationCourseId: 789,
              assessmentResult: assessmentResultToBeSaved,
            });
            calculateCertificationAssessmentScoreInjected.resolves(certificationAssessmentScore);
            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(certificationCourse);
            competenceMarkRepository.save.resolves();

            // when
            await scoringCertificationService.handleV2CertificationScoring({
              event,
              emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
              certificationAssessment,
              assessmentResultRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              calculateCertificationAssessmentScoreInjected,
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
                  status: AssessmentResult.status.REJECTED,
                  assessmentId: 123,
                  emitter: AssessmentResult.emitters.PIX_ALGO,
                  juryId: 7,
                });

              assessmentResultRepository.save.resolves({
                certificationCourseId: 789,
                assessmentResult: assessmentResultToBeSaved,
              });
              calculateCertificationAssessmentScoreInjected.resolves(certificationAssessmentScore);
              certificationCourseRepository.get
                .withArgs({ id: certificationAssessment.certificationCourseId })
                .resolves(certificationCourse);
              competenceMarkRepository.save.resolves();

              // when
              await scoringCertificationService.handleV2CertificationScoring({
                event,
                emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
                certificationAssessment,
                assessmentResultRepository,
                certificationCourseRepository,
                competenceMarkRepository,
                calculateCertificationAssessmentScoreInjected,
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

  context('#handleV3CertificationScoring', function () {
    let answerRepository,
      assessmentResultRepository,
      certificationAssessmentHistoryRepository,
      certificationChallengeForScoringRepository,
      certificationCourseRepository,
      competenceMarkRepository,
      flashAlgorithmConfigurationRepository,
      flashAlgorithmService,
      scoringConfigurationRepository,
      baseFlashAlgorithmConfiguration;
    let clock;
    const now = new Date('2019-01-01T05:06:07Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      answerRepository = {
        findByAssessment: sinon.stub(),
      };
      assessmentResultRepository = { save: sinon.stub() };
      certificationAssessmentHistoryRepository = { save: sinon.stub() };
      certificationChallengeForScoringRepository = { getByCertificationCourseId: sinon.stub() };
      certificationCourseRepository = { get: sinon.stub() };
      competenceMarkRepository = { save: sinon.stub() };
      flashAlgorithmConfigurationRepository = { getMostRecentBeforeDate: sinon.stub() };
      flashAlgorithmService = {
        getCapacityAndErrorRate: sinon.stub(),
        getCapacityAndErrorRateHistory: sinon.stub(),
      };
      scoringConfigurationRepository = { getLatestByDateAndLocale: sinon.stub() };
      baseFlashAlgorithmConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength,
      });
    });

    afterEach(function () {
      clock.restore();
    });

    context('for scoring certification', function () {
      let event;
      let certificationAssessment;
      let certificationCourse;
      const assessmentResultId = 99;
      const assessmentId = 1214;
      const certificationCourseId = 1234;
      const userId = 4567;
      const certificationCourseStartDate = new Date('2022-02-01');

      beforeEach(function () {
        event = new AssessmentCompleted({
          assessmentId,
          userId,
          certificationCourseId: 123,
        });
        certificationAssessment = {
          id: assessmentId,
          certificationCourseId,
          userId,
          createdAt: Symbol('someCreationDate'),
          version: 3,
        };
        certificationCourse = domainBuilder.buildCertificationCourse({
          id: certificationCourseId,
          createdAt: certificationCourseStartDate,
          completedAt: null,
        });

        const scoringConfiguration = domainBuilder.buildV3CertificationScoring({
          competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
        });

        scoringConfigurationRepository.getLatestByDateAndLocale
          .withArgs({ locale: 'fr', date: certificationCourse.getStartDate() })
          .resolves(scoringConfiguration);

        assessmentResultRepository.save.resolves(
          domainBuilder.buildAssessmentResult({
            id: assessmentResultId,
          }),
        );
        competenceMarkRepository.save.resolves();
      });

      describe('when less than the minimum number of answers required by the config has been answered', function () {
        describe('when the candidate did not finish due to a lack of time', function () {
          it('builds and save a lack of answers assessment result', async function () {
            // given
            const expectedCapacity = 2;
            const scoreForCapacity = 640;
            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              createdAt: certificationCourseStartDate,
              abortReason: ABORT_REASONS.CANDIDATE,
            });

            const challenges = _generateCertificationChallengeForScoringList({
              length: minimumAnswersRequiredToValidateACertification - 1,
            });

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challenges[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            const answers = generateAnswersForChallenges({ challenges });

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(challenges);
            answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
            certificationCourseRepository.get
              .withArgs({ id: certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            // when
            await scoringCertificationService.handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationChallengeForScoringRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
            });

            // then
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
              nbPix: scoreForCapacity,
              status: status.REJECTED,
            });
            const expectedAssessmentResult = new AssessmentResult({
              pixScore: scoreForCapacity,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.REJECTED,
              assessmentId: certificationAssessment.id,
              emitter: AssessmentResult.emitters.PIX_ALGO,
              commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
              }),
              commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
              }),
            });

            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 1234,
              assessmentResult: expectedAssessmentResult,
            });
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });

        describe('when the candidate did not finish due to technical difficulties', function () {
          it('should cancel the certification and reject the assessment result', async function () {
            // given
            const abortReason = ABORT_REASONS.TECHNICAL;
            const expectedCapacity = 2;
            const scoreForCapacity = 640;
            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              id: certificationCourseId,
              createdAt: certificationCourseStartDate,
              completedAt: null,
              abortReason,
            });

            const challenges = _generateCertificationChallengeForScoringList({
              length: minimumAnswersRequiredToValidateACertification - 1,
            });

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challenges[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            const answers = generateAnswersForChallenges({ challenges });

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(challenges);

            answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
            certificationCourseRepository.get
              .withArgs({ id: certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            // when
            await scoringCertificationService.handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationChallengeForScoringRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
            });

            // then
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
              nbPix: scoreForCapacity,
              status: status.REJECTED,
            });
            const expectedAssessmentResult = new AssessmentResult({
              pixScore: scoreForCapacity,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.REJECTED,
              assessmentId: certificationAssessment.id,
              emitter: AssessmentResult.emitters.PIX_ALGO,
              commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
              }),
              commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
              }),
            });

            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 1234,
              assessmentResult: expectedAssessmentResult,
            });

            expect(abortedCertificationCourse).to.deep.equal(
              new CertificationCourse({
                ...certificationCourse.toDTO(),
                isCancelled: true,
                abortReason,
              }),
            );

            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });
      });

      describe('when at least the minimum number of answers required by the config has been answered', function () {
        describe('when the certification was completed', function () {
          it('builds and save an assessment result with a validated status', async function () {
            // given
            const expectedCapacity = 2;
            const scoreForCapacity = 640;
            const challenges = _generateCertificationChallengeForScoringList({ length: maximumAssessmentLength });
            const answers = generateAnswersForChallenges({ challenges });
            const assessmentResultId = 123;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: challenges[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(challenges);
            answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
            certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfiguration);
            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });
            assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult({ id: assessmentResultId }));

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            // when
            await scoringCertificationService.handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationChallengeForScoringRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
            });

            // then
            const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
              nbPix: scoreForCapacity,
              status: status.VALIDATED,
            });
            const expectedAssessmentResult = new AssessmentResult({
              pixScore: scoreForCapacity,
              reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
              status: status.VALIDATED,
              assessmentId: certificationAssessment.id,
              emitter: AssessmentResult.emitters.PIX_ALGO,
            });
            expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
              certificationCourseId: 1234,
              assessmentResult: expectedAssessmentResult,
            });
            expect(competenceMarkRepository.save).to.have.been.calledWithExactly(
              domainBuilder.buildCompetenceMark({
                id: undefined,
                assessmentResultId: assessmentResultId,
                area_code: '1',
                competenceId: 'recCompetenceId',
                competence_code: '1.1',
                level: 2,
                score: 0,
              }),
            );
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });

          describe('when the certification would reach a very high score', function () {
            it('should return the score capped based on the maximum available level when the certification was done', async function () {
              // given
              const expectedCapacity = 8;
              const cappedScoreForCapacity = 896;
              const challenges = _generateCertificationChallengeForScoringList({ length: maximumAssessmentLength });

              const answers = generateAnswersForChallenges({ challenges });

              const capacityHistory = [
                domainBuilder.buildCertificationChallengeCapacity({
                  certificationChallengeId: challenges[0].certificationChallengeId,
                  capacity: expectedCapacity,
                }),
              ];

              const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
                capacityHistory,
              });

              certificationChallengeForScoringRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId })
                .resolves(challenges);
              answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
              certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
              flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
                .withArgs(certificationCourseStartDate)
                .resolves(baseFlashAlgorithmConfiguration);
              flashAlgorithmService.getCapacityAndErrorRate
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns({
                  capacity: expectedCapacity,
                });

              flashAlgorithmService.getCapacityAndErrorRateHistory
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns([
                  {
                    capacity: expectedCapacity,
                  },
                ]);

              // when
              await scoringCertificationService.handleV3CertificationScoring({
                event,
                certificationAssessment,
                locale: 'fr',
                answerRepository,
                assessmentResultRepository,
                certificationAssessmentHistoryRepository,
                certificationChallengeForScoringRepository,
                certificationCourseRepository,
                competenceMarkRepository,
                flashAlgorithmConfigurationRepository,
                flashAlgorithmService,
                scoringConfigurationRepository,
              });

              // then
              const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
                nbPix: cappedScoreForCapacity,
                status: status.VALIDATED,
              });
              const expectedAssessmentResult = new AssessmentResult({
                pixScore: cappedScoreForCapacity,
                reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
                status: status.VALIDATED,
                assessmentId: certificationAssessment.id,
                emitter: AssessmentResult.emitters.PIX_ALGO,
              });
              expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
                certificationCourseId: 1234,
                assessmentResult: expectedAssessmentResult,
              });
              expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
                certificationAssessmentHistory,
              );
            });
          });
        });

        describe('when the certification was not completed', function () {
          describe('when the candidate did not finish due to technical difficulties', function () {
            it('should build and save an assessment result with a validated status with the raw score', async function () {
              // given
              const expectedCapacity = 2;
              const rawScore = 640;
              const challenges = _generateCertificationChallengeForScoringList({
                length: minimumAnswersRequiredToValidateACertification,
              });
              const abortReason = ABORT_REASONS.TECHNICAL;
              const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
                id: certificationCourseId,
                completedAt: null,
                createdAt: certificationCourseStartDate,
                abortReason,
              });

              const answers = generateAnswersForChallenges({ challenges });

              const capacityHistory = [
                domainBuilder.buildCertificationChallengeCapacity({
                  certificationChallengeId: challenges[0].certificationChallengeId,
                  capacity: expectedCapacity,
                }),
              ];

              const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
                capacityHistory,
              });

              certificationChallengeForScoringRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId })
                .resolves(challenges);
              answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
              certificationCourseRepository.get
                .withArgs({ id: certificationCourseId })
                .resolves(abortedCertificationCourse);
              flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
                .withArgs(certificationCourseStartDate)
                .resolves(baseFlashAlgorithmConfiguration);
              flashAlgorithmService.getCapacityAndErrorRate
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns({
                  capacity: expectedCapacity,
                });

              flashAlgorithmService.getCapacityAndErrorRateHistory
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns([
                  {
                    capacity: expectedCapacity,
                  },
                ]);

              // when
              await scoringCertificationService.handleV3CertificationScoring({
                event,
                certificationAssessment,
                locale: 'fr',
                answerRepository,
                assessmentResultRepository,
                certificationAssessmentHistoryRepository,
                certificationChallengeForScoringRepository,
                certificationCourseRepository,
                competenceMarkRepository,
                flashAlgorithmConfigurationRepository,
                flashAlgorithmService,
                scoringConfigurationRepository,
              });

              // then
              const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
                nbPix: rawScore,
                status: status.VALIDATED,
              });
              const expectedAssessmentResult = new AssessmentResult({
                pixScore: rawScore,
                reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
                status: status.VALIDATED,
                assessmentId: certificationAssessment.id,
                emitter: AssessmentResult.emitters.PIX_ALGO,
              });
              expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
                certificationCourseId: 1234,
                assessmentResult: expectedAssessmentResult,
              });
              expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
                certificationAssessmentHistory,
              );
            });
          });

          describe('when the candidate did not finish in time', function () {
            it('should build and save an assessment result with a validated status', async function () {
              // given
              const expectedCapacity = 2;
              const pixScore = 640;
              const challenges = _generateCertificationChallengeForScoringList({
                length: minimumAnswersRequiredToValidateACertification,
              });
              const abortReason = ABORT_REASONS.CANDIDATE;
              const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
                id: certificationCourseId,
                createdAt: certificationCourseStartDate,
                completedAt: null,
                abortReason,
              });

              const answers = generateAnswersForChallenges({ challenges });

              const capacityHistory = [
                domainBuilder.buildCertificationChallengeCapacity({
                  certificationChallengeId: challenges[0].certificationChallengeId,
                  capacity: expectedCapacity,
                }),
              ];

              const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
                capacityHistory,
              });

              certificationChallengeForScoringRepository.getByCertificationCourseId
                .withArgs({ certificationCourseId })
                .resolves(challenges);
              answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
              certificationCourseRepository.get
                .withArgs({ id: certificationCourseId })
                .resolves(abortedCertificationCourse);
              flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
                .withArgs(certificationCourseStartDate)
                .resolves(baseFlashAlgorithmConfiguration);
              flashAlgorithmService.getCapacityAndErrorRate
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns({
                  capacity: expectedCapacity,
                });
              flashAlgorithmService.getCapacityAndErrorRateHistory
                .withArgs({
                  challenges,
                  allAnswers: answers,
                  capacity: sinon.match.number,
                  variationPercent: undefined,
                  variationPercentUntil: undefined,
                  doubleMeasuresUntil: undefined,
                })
                .returns([
                  {
                    capacity: expectedCapacity,
                  },
                ]);

              // when
              await scoringCertificationService.handleV3CertificationScoring({
                event,
                certificationAssessment,
                locale: 'fr',
                answerRepository,
                assessmentResultRepository,
                certificationAssessmentHistoryRepository,
                certificationChallengeForScoringRepository,
                certificationCourseRepository,
                competenceMarkRepository,
                flashAlgorithmConfigurationRepository,
                flashAlgorithmService,
                scoringConfigurationRepository,
              });

              // then
              const certificationAssessmentScore = domainBuilder.buildCertificationAssessmentScoreV3({
                nbPix: pixScore,
                status: status.VALIDATED,
              });
              const expectedAssessmentResult = new AssessmentResult({
                pixScore,
                reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
                status: status.VALIDATED,
                assessmentId: certificationAssessment.id,
                emitter: AssessmentResult.emitters.PIX_ALGO,
              });
              expect(assessmentResultRepository.save).to.have.been.calledWithExactly({
                certificationCourseId: 1234,
                assessmentResult: expectedAssessmentResult,
              });
              expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
                certificationAssessmentHistory,
              );
            });
          });
        });
      });
    });

    context('for rescoring certification', function () {
      let baseFlashAlgorithmConfig, scoringConfiguration;

      beforeEach(function () {
        baseFlashAlgorithmConfig = domainBuilder.buildFlashAlgorithmConfiguration({
          maximumAssessmentLength,
        });

        scoringConfiguration = domainBuilder.buildV3CertificationScoring({
          competencesForScoring: [domainBuilder.buildCompetenceForScoring()],
        });

        assessmentResultRepository.save.resolves(domainBuilder.buildAssessmentResult());
        competenceMarkRepository.save.resolves();
      });

      describe('when less than the minimum number of answers required by the config has been answered', function () {
        describe('when the certification was not finished due to a lack of time', function () {
          it('should save the score with a rejected status', async function () {
            // given
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              version: CertificationVersion.V3,
            });

            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              abortReason: ABORT_REASONS.CANDIDATE,
            });

            const challenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification - 1 });
            const certificationChallengesForScoring = challenges.map((challenge) =>
              domainBuilder.buildCertificationChallengeForScoring(challenge),
            );
            const answers = generateAnswersForChallenges({ challenges });

            const expectedCapacity = 2;
            const scoreForCapacity = 640;
            const { certificationCourseId } = certificationAssessment;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(certificationChallengesForScoring);

            answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(abortedCertificationCourse);

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: certificationChallengesForScoring,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: certificationChallengesForScoring,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            const event = new CertificationJuryDone({
              certificationCourseId,
            });

            // when
            await scoringCertificationService.handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationChallengeForScoringRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
            });

            // then
            const expectedResult = {
              certificationCourseId,
              assessmentResult: new AssessmentResult({
                emitter: AssessmentResult.emitters.PIX_ALGO,
                pixScore: scoreForCapacity,
                reproducibilityRate: 100,
                status: AssessmentResult.status.REJECTED,
                competenceMarks: [],
                assessmentId: 123,
                commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                  commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
                }),
                commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                  commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_LACK_OF_ANSWERS,
                }),
              }),
            };

            expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });

        describe('when the certification was not finished due to technical difficulties', function () {
          it('should save the score with a rejected status and cancel the certification course', async function () {
            // given
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              version: CertificationVersion.V3,
            });

            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              abortReason: ABORT_REASONS.TECHNICAL,
            });

            const challenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification - 1 });
            const certificationChallengesForScoring = challenges.map((challenge) =>
              domainBuilder.buildCertificationChallengeForScoring(challenge),
            );
            const answers = generateAnswersForChallenges({ challenges });

            const expectedCapacity = 2;
            const scoreForCapacity = 640;
            const { certificationCourseId } = certificationAssessment;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(certificationChallengesForScoring);

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: certificationChallengesForScoring,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: certificationChallengesForScoring,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            const event = new CertificationJuryDone({
              certificationCourseId,
            });

            // when
            await scoringCertificationService.handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationChallengeForScoringRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
            });

            // then
            const expectedResult = {
              certificationCourseId,
              assessmentResult: new AssessmentResult({
                emitter: AssessmentResult.emitters.PIX_ALGO,
                pixScore: scoreForCapacity,
                reproducibilityRate: 100,
                status: AssessmentResult.status.REJECTED,
                competenceMarks: [],
                assessmentId: 123,
                commentForCandidate: domainBuilder.certification.shared.buildJuryComment.candidate({
                  commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
                }),
                commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
                  commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_LACK_OF_ANSWERS_FOR_TECHNICAL_REASON,
                }),
              }),
            };
            expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });
      });

      describe('when not all questions were answered', function () {
        describe('when the candidate did not finish due to technical difficulties', function () {
          it('should save the raw score', async function () {
            // given
            const certificationCourseStartDate = new Date('2022-01-01');
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              version: CertificationVersion.V3,
            });

            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              abortReason: ABORT_REASONS.TECHNICAL,
              createdAt: certificationCourseStartDate,
            });

            const challenges = generateChallengeList({ length: minimumAnswersRequiredToValidateACertification });
            const certificationChallengesForScoring = challenges.map((challenge) =>
              domainBuilder.buildCertificationChallengeForScoring(challenge),
            );
            const answers = generateAnswersForChallenges({ challenges });

            const expectedCapacity = 2;
            const rawScore = 640;
            const { certificationCourseId } = certificationAssessment;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(certificationChallengesForScoring);

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(abortedCertificationCourse.getStartDate())
              .resolves(baseFlashAlgorithmConfig);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: certificationChallengesForScoring,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: certificationChallengesForScoring,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            const event = new CertificationJuryDone({
              certificationCourseId,
            });

            // when
            await scoringCertificationService.handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationChallengeForScoringRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
            });

            // then
            const expectedResult = {
              certificationCourseId,
              assessmentResult: new AssessmentResult({
                emitter: AssessmentResult.emitters.PIX_ALGO,
                pixScore: rawScore,
                reproducibilityRate: 100,
                status: AssessmentResult.status.VALIDATED,
                competenceMarks: [],
                assessmentId: 123,
              }),
            };

            expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });
      });

      describe('when all the questions were answered', function () {
        it('should save the score', async function () {
          // given
          const certificationCourseStartDate = new Date('2022-01-01');
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            version: CertificationVersion.V3,
          });

          const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
            abortReason: ABORT_REASONS.TECHNICAL,
            createdAt: certificationCourseStartDate,
          });

          const challenges = generateChallengeList({ length: maximumAssessmentLength });
          const certificationChallengesForScoring = challenges.map((challenge) =>
            domainBuilder.buildCertificationChallengeForScoring(challenge),
          );
          const answers = generateAnswersForChallenges({ challenges });

          const expectedCapacity = 2;
          const scoreForCapacity = 640;
          const { certificationCourseId } = certificationAssessment;

          const capacityHistory = [
            domainBuilder.buildCertificationChallengeCapacity({
              certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
              capacity: expectedCapacity,
            }),
          ];

          const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
            capacityHistory,
          });

          certificationChallengeForScoringRepository.getByCertificationCourseId
            .withArgs({ certificationCourseId })
            .resolves(certificationChallengesForScoring);

          scoringConfigurationRepository.getLatestByDateAndLocale
            .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
            .resolves(scoringConfiguration);

          flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
            .withArgs(certificationCourseStartDate)
            .resolves(baseFlashAlgorithmConfig);

          answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

          certificationCourseRepository.get
            .withArgs({ id: certificationAssessment.certificationCourseId })
            .resolves(abortedCertificationCourse);

          flashAlgorithmService.getCapacityAndErrorRate
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              capacity: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns({
              capacity: expectedCapacity,
            });

          flashAlgorithmService.getCapacityAndErrorRateHistory
            .withArgs({
              challenges: certificationChallengesForScoring,
              allAnswers: answers,
              capacity: sinon.match.number,
              variationPercent: undefined,
              variationPercentUntil: undefined,
              doubleMeasuresUntil: undefined,
            })
            .returns([
              {
                capacity: expectedCapacity,
              },
            ]);

          const event = new CertificationJuryDone({
            certificationCourseId,
          });

          // when
          await scoringCertificationService.handleV3CertificationScoring({
            event,
            certificationAssessment,
            locale: 'fr',
            answerRepository,
            assessmentResultRepository,
            certificationAssessmentHistoryRepository,
            certificationChallengeForScoringRepository,
            certificationCourseRepository,
            competenceMarkRepository,
            flashAlgorithmConfigurationRepository,
            flashAlgorithmService,
            scoringConfigurationRepository,
          });

          // then
          const expectedResult = {
            certificationCourseId,
            assessmentResult: new AssessmentResult({
              emitter: AssessmentResult.emitters.PIX_ALGO,
              pixScore: scoreForCapacity,
              reproducibilityRate: 100,
              status: AssessmentResult.status.VALIDATED,
              competenceMarks: [],
              assessmentId: 123,
            }),
          };

          expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);
          expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
            certificationAssessmentHistory,
          );
          expect(competenceMarkRepository.save).to.have.been.calledWithExactly(
            domainBuilder.buildCompetenceMark({
              id: undefined,
              assessmentResultId: 123,
              area_code: '1',
              competenceId: 'recCompetenceId',
              competence_code: '1.1',
              level: 2,
              score: 0,
            }),
          );
        });

        describe('when certification is rejected for fraud', function () {
          it('should save the score with rejected status', async function () {
            const certificationCourseStartDate = new Date('2022-01-01');
            // given
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              version: CertificationVersion.V3,
            });

            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              isRejectedForFraud: true,
              createdAt: certificationCourseStartDate,
            });

            const challenges = generateChallengeList({ length: maximumAssessmentLength });
            const certificationChallengesForScoring = challenges.map((challenge) =>
              domainBuilder.buildCertificationChallengeForScoring(challenge),
            );
            const answers = generateAnswersForChallenges({ challenges });

            const expectedCapacity = 2;
            const scoreForCapacity = 640;
            const { certificationCourseId } = certificationAssessment;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(certificationChallengesForScoring);

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfig);

            answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: certificationChallengesForScoring,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: certificationChallengesForScoring,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            const event = new CertificationCourseRejected({
              certificationCourseId,
              juryId: 7,
            });

            // when
            await scoringCertificationService.handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationChallengeForScoringRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
            });

            // then
            const assessmentResultToBeSaved = domainBuilder.certification.scoring.buildAssessmentResult.fraud({
              pixScore: scoreForCapacity,
              reproducibilityRate: 100,
              assessmentId: 123,
              juryId: 7,
            });

            expect(assessmentResultRepository.save).to.have.been.calledWith({
              certificationCourseId: 123,
              assessmentResult: assessmentResultToBeSaved,
            });
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });

        describe('when the certification would reach a very high score', function () {
          it('should return the score capped based on the maximum available level when the certification was done', async function () {
            const certificationCourseStartDate = new Date('2022-01-01');
            // given
            const certificationAssessment = domainBuilder.buildCertificationAssessment({
              version: CertificationVersion.V3,
            });

            const abortedCertificationCourse = domainBuilder.buildCertificationCourse({
              createdAt: certificationCourseStartDate,
            });

            const challenges = generateChallengeList({ length: maximumAssessmentLength });
            const certificationChallengesForScoring = challenges.map((challenge) =>
              domainBuilder.buildCertificationChallengeForScoring(challenge),
            );

            const answers = generateAnswersForChallenges({ challenges });

            const expectedCapacity = 8;
            const cappedscoreForCapacity = 896;
            const { certificationCourseId } = certificationAssessment;

            const capacityHistory = [
              domainBuilder.buildCertificationChallengeCapacity({
                certificationChallengeId: certificationChallengesForScoring[0].certificationChallengeId,
                capacity: expectedCapacity,
              }),
            ];

            const certificationAssessmentHistory = domainBuilder.buildCertificationAssessmentHistory({
              capacityHistory,
            });

            certificationChallengeForScoringRepository.getByCertificationCourseId
              .withArgs({ certificationCourseId })
              .resolves(certificationChallengesForScoring);

            scoringConfigurationRepository.getLatestByDateAndLocale
              .withArgs({ locale: 'fr', date: abortedCertificationCourse.getStartDate() })
              .resolves(scoringConfiguration);

            flashAlgorithmConfigurationRepository.getMostRecentBeforeDate
              .withArgs(certificationCourseStartDate)
              .resolves(baseFlashAlgorithmConfig);

            answerRepository.findByAssessment.withArgs(certificationAssessment.id).resolves(answers);

            certificationCourseRepository.get
              .withArgs({ id: certificationAssessment.certificationCourseId })
              .resolves(abortedCertificationCourse);

            flashAlgorithmService.getCapacityAndErrorRate
              .withArgs({
                challenges: certificationChallengesForScoring,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns({
                capacity: expectedCapacity,
              });

            flashAlgorithmService.getCapacityAndErrorRateHistory
              .withArgs({
                challenges: certificationChallengesForScoring,
                allAnswers: answers,
                capacity: sinon.match.number,
                variationPercent: undefined,
                variationPercentUntil: undefined,
                doubleMeasuresUntil: undefined,
              })
              .returns([
                {
                  capacity: expectedCapacity,
                },
              ]);

            const expectedResult = {
              certificationCourseId,
              assessmentResult: new AssessmentResult({
                emitter: AssessmentResult.emitters.PIX_ALGO,
                pixScore: cappedscoreForCapacity,
                reproducibilityRate: 100,
                status: AssessmentResult.status.VALIDATED,
                competenceMarks: [],
                assessmentId: 123,
              }),
            };

            const event = new CertificationJuryDone({
              certificationCourseId,
            });

            // when
            await scoringCertificationService.handleV3CertificationScoring({
              event,
              certificationAssessment,
              locale: 'fr',
              answerRepository,
              assessmentResultRepository,
              certificationAssessmentHistoryRepository,
              certificationChallengeForScoringRepository,
              certificationCourseRepository,
              competenceMarkRepository,
              flashAlgorithmConfigurationRepository,
              flashAlgorithmService,
              scoringConfigurationRepository,
            });

            // then
            expect(assessmentResultRepository.save).to.have.been.calledWith(expectedResult);
            expect(certificationAssessmentHistoryRepository.save).to.have.been.calledWithExactly(
              certificationAssessmentHistory,
            );
          });
        });
      });
    });
  });
});

const _generateCertificationChallengeForScoringList = ({ length }) => {
  return generateChallengeList({
    length,
  }).map(
    ({ discriminant, difficulty }, index) =>
      new CertificationChallengeForScoring({
        certificationChallengeId: `certification-challenge-id-${index}`,
        discriminant,
        difficulty,
      }),
  );
};
