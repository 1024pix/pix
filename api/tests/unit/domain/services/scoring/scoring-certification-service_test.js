import _ from 'lodash';
import { expect, sinon, domainBuilder, catchErr } from '../../../../test-helper';
import scoringCertificationService from '../../../../../lib/domain/services/scoring/scoring-certification-service';
import { states } from '../../../../../lib/domain/models/CertificationAssessment';
import placementProfileService from '../../../../../lib/domain/services/placement-profile-service';
import areaRepository from '../../../../../lib/infrastructure/repositories/area-repository';
import { CertificationComputeError } from '../../../../../lib/domain/errors';

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
    domainBuilder.buildAnswer
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
    domainBuilder.buildAnswer
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
    domainBuilder.buildAnswer
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
    domainBuilder.buildAnswer
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
  domainBuilder.buildCertificationChallengeWithType
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

describe('Unit | Service | Certification Result Service', function () {
  context('#calculateCertificationAssessmentScore', function () {
    let certificationAssessment, certificationAssessmentData, expectedCertifiedCompetences;
    let competenceWithMarks_1_1, competenceWithMarks_2_2, competenceWithMarks_3_3, competenceWithMarks_4_4;
    let areaRepositoryListStub;

    beforeEach(function () {
      areaRepositoryListStub = sinon.stub(areaRepository, 'list');
      areaRepositoryListStub.resolves(['1', '2', '3', '4', '5', '6'].map((code) => ({ id: `area${code}`, code })));
      certificationAssessmentData = {
        id: 1,
        userId: 11,
        certificationCourseId: 111,
        createdAt: '2020-02-01T00:00:00Z',
        completedAt: '2020-02-01T00:00:00Z',
        state: states.COMPLETED,
        isV2Certification: true,
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
          domainBuilder.buildAnswer
        );

        const certificationAssessment = {
          certificationAnswersByDate,
          certificationChallenges: challenges,
        };

        sinon
          .stub(placementProfileService, 'getPlacementProfile')
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            isV2Certification: certificationAssessment.isV2Certification,
          })
          .resolves({ userCompetences });

        // when
        const error = await catchErr(scoringCertificationService.calculateCertificationAssessmentScore)({
          certificationAssessment,
          continueOnError: false,
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
          domainBuilder.buildAnswer
        );

        const certificationAssessment = {
          certificationAnswersByDate,
          certificationChallenges: challenges,
        };

        sinon
          .stub(placementProfileService, 'getPlacementProfile')
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            isV2Certification: certificationAssessment.isV2Certification,
          })
          .resolves({ userCompetences });

        // when
        const error = await catchErr(scoringCertificationService.calculateCertificationAssessmentScore)({
          certificationAssessment,
          continueOnError: false,
        });

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal(
          "L’utilisateur n’a pas répondu à toutes les questions, alors qu'aucune raison d'abandon n'a été fournie."
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
          domainBuilder.buildAnswer
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
          domainBuilder.buildCertificationChallengeWithType
        );

        const certificationAssessment = {
          certificationAnswersByDate,
          certificationChallenges: challenges,
        };

        sinon
          .stub(placementProfileService, 'getPlacementProfile')
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            isV2Certification: certificationAssessment.isV2Certification,
          })
          .resolves({ userCompetences });

        // when
        const error = await catchErr(scoringCertificationService.calculateCertificationAssessmentScore)({
          certificationAssessment,
          continueOnError: false,
        });

        // then
        expect(error).to.be.instanceOf(CertificationComputeError);
        expect(error.message).to.equal('Pas assez de challenges posés pour la compétence 4.4');
      });
    });

    context('Compute certification result for jury (continue on error)', function () {
      const continueOnError = true;

      beforeEach(function () {
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          ...certificationAssessmentData,
          certificationAnswersByDate: wrongAnswersForAllChallenges(),
          certificationChallenges: challenges,
        });

        sinon
          .stub(placementProfileService, 'getPlacementProfile')
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            isV2Certification: certificationAssessment.isV2Certification,
          })
          .resolves({ userCompetences });
      });

      it('should get user profile', async function () {
        // when
        await scoringCertificationService.calculateCertificationAssessmentScore({
          certificationAssessment,
          continueOnError,
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
          });

          // then
          expect(percentageCorrectAnswers).to.deep.equal(64);
        });

        context('when one competence is evaluated with 3 challenges', function () {
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
                domainBuilder.buildAnswer
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
                domainBuilder.buildCertificationChallengeWithType
              );

              const userCompetences = [_buildUserCompetence(competence_1, positionedScore, positionedLevel)];

              certificationAssessment.certificationAnswersByDate = answers;
              certificationAssessment.certificationChallenges = challenges;
              placementProfileService.getPlacementProfile.restore();
              sinon
                .stub(placementProfileService, 'getPlacementProfile')
                .withArgs({
                  userId: certificationAssessment.userId,
                  limitDate: certificationAssessment.createdAt,
                  isV2Certification: certificationAssessment.isV2Certification,
                })
                .resolves({ userCompetences });

              // When
              const certificationAssessmentScore =
                await scoringCertificationService.calculateCertificationAssessmentScore({
                  certificationAssessment,
                  continueOnError,
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

      beforeEach(function () {
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          ...certificationAssessmentData,
          certificationAnswersByDate: wrongAnswersForAllChallenges(),
          certificationChallenges: challenges,
        });
        sinon
          .stub(placementProfileService, 'getPlacementProfile')
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            isV2Certification: certificationAssessment.isV2Certification,
          })
          .resolves({ userCompetences });
      });

      context('when reproducibility rate is < 50%', function () {
        it('should return list of competences with all certifiedLevel at -1', async function () {
          // when
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
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
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when only one challenge is asked for a competence', function () {
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
            domainBuilder.buildCertificationChallengeWithType
          );

          placementProfileService.getPlacementProfile.restore();
          sinon
            .stub(placementProfileService, 'getPlacementProfile')
            .withArgs({
              userId: certificationAssessment.userId,
              limitDate: certificationAssessment.createdAt,
              isV2Certification: certificationAssessment.isV2Certification,
            })
            .resolves({ userCompetences });

          certificationAssessment.certificationAnswersByDate = _.map(
            [
              { challengeId: 'challenge_A_for_competence_5', result: 'ok' },
              { challengeId: 'challenge_A_for_competence_6', result: 'ko' },
              { challengeId: 'challenge_B_for_competence_6', result: 'ok' },
              { challengeId: 'challenge_C_for_competence_6', result: 'ko' },
            ],
            domainBuilder.buildAnswer
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
          });

          // then
          expect(certificationAssessmentScore.competenceMarks).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when challenges contains one QROCM-dep challenge to validate two skills', function () {
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
            domainBuilder.buildCertificationChallengeWithType
          );

          placementProfileService.getPlacementProfile.restore();
          sinon
            .stub(placementProfileService, 'getPlacementProfile')
            .withArgs({
              userId: certificationAssessment.userId,
              limitDate: certificationAssessment.createdAt,
              isV2Certification: certificationAssessment.isV2Certification,
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
            domainBuilder.buildAnswer
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
            domainBuilder.buildAnswer
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
            domainBuilder.buildCertificationChallengeWithType
          );
          certificationAssessment.certificationChallenges = challenges;

          certificationAssessment.certificationAnswersByDate = _.map(
            [
              { challengeId: 'challenge_A_for_competence_1', result: 'ko' },

              { challengeId: 'challenge_M_for_competence_5', result: 'ok' },
              { challengeId: 'challenge_N_for_competence_6', result: 'ok' },
            ],
            domainBuilder.buildAnswer
          );
        });

        it('should not include the extra challenges when computing reproducibility', async function () {
          // when
          const certificationAssessmentScore = await scoringCertificationService.calculateCertificationAssessmentScore({
            certificationAssessment,
            continueOnError,
          });

          // then
          expect(certificationAssessmentScore.percentageCorrectAnswers).to.equal(0);
        });
      });
    });

    context('non neutralization rate trustability', function () {
      beforeEach(function () {
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          ...certificationAssessmentData,
          certificationAnswersByDate: wrongAnswersForAllChallenges(),
          certificationChallenges: challenges,
        });
        certificationAssessment.certificationAnswersByDate = correctAnswersForAllChallenges();
        sinon
          .stub(placementProfileService, 'getPlacementProfile')
          .withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            isV2Certification: certificationAssessment.isV2Certification,
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
          });

          // then
          expect(certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted).to.be.false;
        });
      });
    });
  });
});
