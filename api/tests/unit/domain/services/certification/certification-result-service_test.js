const _ = require('lodash');
const { expect, sinon, domainBuilder } = require('../../../../test-helper');
const certificationResultService = require('../../../../../lib/domain/services/certification-result-service');
const CertificationAssessment = require('../../../../../lib/domain/models/CertificationAssessment');
const { states } = require('../../../../../lib/domain/models/CertificationAssessment');
const Answer = require('../../../../../lib/domain/models/Answer');
const challengeRepository = require('../../../../../lib/infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../../../../lib/infrastructure/repositories/competence-repository');
const placementProfileService = require('../../../../../lib/domain/services/placement-profile-service');
const UserCompetence = require('../../../../../lib/domain/models/UserCompetence');

function _buildUserCompetence(competence, pixScore, estimatedLevel) {
  return new UserCompetence({ ...competence, estimatedLevel, pixScore });
}

const pixForCompetence1 = 10;
const pixForCompetence2 = 20;
const pixForCompetence3 = 30;
const pixForCompetence4 = 40;
const UNCERTIFIED_LEVEL = -1;
const totalPix = pixForCompetence1 + pixForCompetence2 + pixForCompetence3 + pixForCompetence4;

const correctAnswersForAllChallenges = () => _.map([
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
], domainBuilder.buildAnswer);

const wrongAnswersForAllChallenges = () => _.map([
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
], domainBuilder.buildAnswer);

const answersToHaveOnlyTheLastCompetenceFailed = () => _.map([
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
], domainBuilder.buildAnswer);

const answersWithReproducibilityRateLessThan80 = () => _.map([
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
], domainBuilder.buildAnswer);

const challengesFromAirTable = _.map([
  { id: 'challenge_A_for_competence_1', competenceId: 'competence_1', type: 'QCM' },
  { id: 'challenge_B_for_competence_1', competenceId: 'competence_1', type: 'QCM' },
  { id: 'challenge_C_for_competence_1', competenceId: 'competence_1', type: 'QCM' },
  { id: 'challenge_D_for_competence_2', competenceId: 'competence_2', type: 'QCM' },
  { id: 'challenge_E_for_competence_2', competenceId: 'competence_2', type: 'QCM' },
  { id: 'challenge_F_for_competence_2', competenceId: 'competence_2', type: 'QCM' },
  { id: 'challenge_G_for_competence_3', competenceId: 'competence_3', type: 'QCM' },
  { id: 'challenge_H_for_competence_3', competenceId: 'competence_3', type: 'QCM' },
  { id: 'challenge_I_for_competence_3', competenceId: 'competence_3', type: 'QCM' },
  { id: 'challenge_J_for_competence_4', competenceId: 'competence_4', type: 'QCM' },
  { id: 'challenge_K_for_competence_4', competenceId: 'competence_4', type: 'QCM' },
  { id: 'challenge_L_for_competence_4', competenceId: 'competence_4', type: 'QCM' },
  { id: 'challenge_M_for_competence_5', competenceId: 'competence_5', type: 'QCM' },
  { id: 'challenge_N_for_competence_6', competenceId: 'competence_6', type: 'QCM' },
], domainBuilder.buildChallenge);

const challenges = _.map([
  { challengeId: 'challenge_A_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeA_1' },
  { challengeId: 'challenge_C_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeC_1' },
  { challengeId: 'challenge_B_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeB_1' },
  { challengeId: 'challenge_D_for_competence_2', competenceId: 'competence_2', associatedSkillName: '@skillChallengeD_2' },
  { challengeId: 'challenge_E_for_competence_2', competenceId: 'competence_2', associatedSkillName: '@skillChallengeE_2' },
  { challengeId: 'challenge_F_for_competence_2', competenceId: 'competence_2', associatedSkillName: '@skillChallengeF_2' },
  { challengeId: 'challenge_G_for_competence_3', competenceId: 'competence_3', associatedSkillName: '@skillChallengeG_3' },
  { challengeId: 'challenge_H_for_competence_3', competenceId: 'competence_3', associatedSkillName: '@skillChallengeH_3' },
  { challengeId: 'challenge_I_for_competence_3', competenceId: 'competence_3', associatedSkillName: '@skillChallengeI_3' },
  { challengeId: 'challenge_J_for_competence_4', competenceId: 'competence_4', associatedSkillName: '@skillChallengeJ_4' },
  { challengeId: 'challenge_K_for_competence_4', competenceId: 'competence_4', associatedSkillName: '@skillChallengeK_4' },
  { challengeId: 'challenge_L_for_competence_4', competenceId: 'competence_4', associatedSkillName: '@skillChallengeL_4' },
], domainBuilder.buildCertificationChallenge);

const competence_1 = domainBuilder.buildCompetence({ id: 'competence_1', index: '1.1', area: { code: '1' }, name: 'Mener une recherche' });
const competence_2 = domainBuilder.buildCompetence({ id: 'competence_2', index: '2.2', area: { code: '2' }, name: 'Partager' });
const competence_3 = domainBuilder.buildCompetence({ id: 'competence_3', index: '3.3', area: { code: '3' }, name: 'Adapter' });
const competence_4 = domainBuilder.buildCompetence({ id: 'competence_4', index: '4.4', area: { code: '4' }, name: 'Résoudre' });
const competence_5 = domainBuilder.buildCompetence({ id: 'competence_5', index: '5.5', area: { code: '5' }, name: 'Chercher' });
const competence_6 = domainBuilder.buildCompetence({ id: 'competence_6', index: '6.6', area: { code: '6' }, name: 'Trouver' });
const allPixCompetencesFromAirtable = [ competence_1, competence_2, competence_3, competence_4, competence_5, competence_6 ];

const userCompetences = [
  _buildUserCompetence(competence_1, pixForCompetence1, 1),
  _buildUserCompetence(competence_2, pixForCompetence2, 2),
  _buildUserCompetence(competence_3, pixForCompetence3, 3),
  _buildUserCompetence(competence_4, pixForCompetence4, 4),
];

describe('Unit | Service | Certification Result Service', function() {

  describe('#getCertificationResult', () => {
    let certificationAssessment;
    const certificationAssessmentData = {
      id: 1,
      userId: 11,
      certificationCourseId: 111,
      createdAt: '2020-02-01T00:00:00Z',
      completedAt: '2020-02-01T00:00:00Z',
      state: states.COMPLETED,
      isV2Certification: true,
    };

    const competenceWithMarks_1_1 = {
      index: '1.1',
      area_code: '1',
      id: 'competence_1',
      name: 'Mener une recherche',
      obtainedLevel: UNCERTIFIED_LEVEL,
      positionedLevel: 1,
      positionedScore: 10,
      obtainedScore: 0,
    };

    const competenceWithMarks_2_2 = {
      index: '2.2',
      area_code: '2',
      id: 'competence_2',
      name: 'Partager',
      obtainedLevel: UNCERTIFIED_LEVEL,
      positionedLevel: 2,
      positionedScore: 20,
      obtainedScore: 0,
    };

    const competenceWithMarks_3_3 = {
      index: '3.3',
      area_code: '3',
      id: 'competence_3',
      name: 'Adapter',
      obtainedLevel: UNCERTIFIED_LEVEL,
      positionedLevel: 3,
      positionedScore: 30,
      obtainedScore: 0,
    };

    const competenceWithMarks_4_4 = {
      index: '4.4',
      area_code: '4',
      id: 'competence_4',
      name: 'Résoudre',
      obtainedLevel: UNCERTIFIED_LEVEL,
      positionedLevel: 4,
      positionedScore: 40,
      obtainedScore: 0,
    };

    const expectedCertifiedCompetences = [
      competenceWithMarks_1_1,
      competenceWithMarks_2_2,
      competenceWithMarks_3_3,
      competenceWithMarks_4_4,
    ];

    describe('Compute certification result for jury (continue on error)', () => {
      const continueOnError = true;

      beforeEach(() => {
        certificationAssessment = new CertificationAssessment({
          ...certificationAssessmentData,
          certificationAnswersByDate: wrongAnswersForAllChallenges(),
          certificationChallenges: challenges,
        });

        sinon.stub(competenceRepository, 'listPixCompetencesOnly').resolves(allPixCompetencesFromAirtable);
        sinon.stub(challengeRepository, 'findOperative').resolves(challengesFromAirTable);
        sinon.stub(placementProfileService, 'getPlacementProfile').withArgs({
          userId: certificationAssessment.userId,
          limitDate: certificationAssessment.createdAt,
          isV2Certification: certificationAssessment.isV2Certification,
        }).resolves({ userCompetences });
      });

      it('should get user profile', async () => {
        // when
        await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

        // then
        sinon.assert.calledOnce(placementProfileService.getPlacementProfile);
      });

      it('should retrieve validated challenges', async () => {
        // when
        await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

        // then
        sinon.assert.calledOnce(challengeRepository.findOperative);
      });

      it('should retrieve competences list', async () => {
        // when
        await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

        // then
        sinon.assert.calledOnce(competenceRepository.listPixCompetencesOnly);
      });

      context('when assessment is just started', () => {
        let startedCertificationAssessment;

        beforeEach(() => {
          startedCertificationAssessment = new CertificationAssessment({
            ...certificationAssessment,
            completedAt: null,
            state: states.STARTED,
          });
        });

        it('should return totalScore = 0', async () => {
          // when
          const result = await certificationResultService.getCertificationResult({
            certificationAssessment: startedCertificationAssessment,
            continueOnError,
          });

          // then
          expect(result.totalScore).to.equal(0);

        });

        it('should return list of competences with all certifiedLevel at -1', async () => {
          // when
          const result = await certificationResultService.getCertificationResult({
            certificationAssessment: startedCertificationAssessment,
            continueOnError,
          });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is < 50%', () => {

        it('should return totalScore = 0', async () => {
          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.totalScore).to.equal(0);
        });

        it('should return list of competences with all certifiedLevel at -1', async () => {
          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is between 80% and 100%', () => {

        beforeEach(() => {
          certificationAssessment.certificationAnswersByDate = correctAnswersForAllChallenges();
        });

        it('should ignore answers with no matching challenge', async () => {
          // when
          certificationAssessment.certificationChallenges = [];
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.totalScore).to.equal(0);
        });

        it('should return totalScore = all pix', async () => {
          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.totalScore).to.equal(totalPix);
        });

        it('should return list of competences with all certifiedLevel equal to estimatedLevel', async () => {
          // given
          const expectedCertifiedCompetences = [
            {
              ...competenceWithMarks_1_1,
              obtainedLevel: 1,
              obtainedScore: pixForCompetence1,
            }, {
              ...competenceWithMarks_2_2,
              obtainedLevel: 2,
              obtainedScore: pixForCompetence2,
            }, {
              ...competenceWithMarks_3_3,
              obtainedLevel: 3,
              obtainedScore: pixForCompetence3,
            }, {
              ...competenceWithMarks_4_4,
              obtainedLevel: 4,
              obtainedScore: pixForCompetence4,
            },
          ];

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });

        it('should return totalScore = (all pix - one competence pix) when one competence is totally false', async () => {
          // given
          certificationAssessment.certificationAnswersByDate = answersToHaveOnlyTheLastCompetenceFailed();

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.totalScore).to.equal(totalPix - pixForCompetence4);
        });

        it('should return list of competences with certifiedLevel = estimatedLevel except for failed competence', async () => {
          // given
          certificationAssessment.certificationAnswersByDate = answersToHaveOnlyTheLastCompetenceFailed();
          const expectedCertifiedCompetences = [{
            ...competenceWithMarks_1_1,
            obtainedLevel: 1,
            obtainedScore: pixForCompetence1,
          }, {
            ...competenceWithMarks_2_2,
            obtainedLevel: 2,
            obtainedScore: pixForCompetence2,
          }, {
            ...competenceWithMarks_3_3,
            obtainedLevel: 3,
            obtainedScore: pixForCompetence3,
          }, {
            ...competenceWithMarks_4_4,
          }];

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is between 50% and 80%', () => {
        beforeEach(() => {
          certificationAssessment.certificationAnswersByDate = answersWithReproducibilityRateLessThan80();
        });

        it('should return totalScore = all pix minus 8 for one competence with 1 error and minus all pix for others false competences', async () => {
          // given
          const malusForFalseAnswer = 8;
          const expectedScore = totalPix - pixForCompetence3 - 2 * malusForFalseAnswer;

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.totalScore).to.equal(expectedScore);
        });

        it('should return list of competences with certifiedLevel less or equal to estimatedLevel', async () => {
          // given
          const malusForFalseAnswer = 8;
          const expectedCertifiedCompetences = [{
            index: '1.1',
            area_code: '1',
            id: 'competence_1',
            name: 'Mener une recherche',
            obtainedLevel: 0,
            positionedLevel: 1,
            positionedScore: 10,
            obtainedScore: pixForCompetence1 - malusForFalseAnswer,
          }, {
            index: '2.2',
            area_code: '2',
            id: 'competence_2',
            name: 'Partager',
            obtainedLevel: 2,
            positionedLevel: 2,
            positionedScore: 20,
            obtainedScore: pixForCompetence2,
          }, {
            index: '3.3',
            area_code: '3',
            id: 'competence_3',
            name: 'Adapter',
            obtainedLevel: UNCERTIFIED_LEVEL,

            positionedLevel: 3,
            positionedScore: 30,
            obtainedScore: 0,
          }, {
            index: '4.4',
            area_code: '4',
            id: 'competence_4',
            name: 'Résoudre',
            obtainedLevel: 3,
            positionedLevel: 4,
            positionedScore: 40,
            obtainedScore: pixForCompetence4 - malusForFalseAnswer,
          }];

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });

        it('should return a object contains information about competences and challenges', async () => {
          // given
          const malusForFalseAnswer = 8;
          const expectedCertifiedCompetences = [{
            index: '1.1',
            area_code: '1',
            id: 'competence_1',
            name: 'Mener une recherche',
            obtainedLevel: 0,
            positionedLevel: 1,
            positionedScore: 10,
            obtainedScore: pixForCompetence1 - malusForFalseAnswer,
          }, {
            index: '2.2',
            area_code: '2',
            id: 'competence_2',
            name: 'Partager',
            obtainedLevel: 2,
            positionedLevel: 2,
            positionedScore: 20,
            obtainedScore: pixForCompetence2,
          }, {
            index: '3.3',
            area_code: '3',
            id: 'competence_3',
            name: 'Adapter',
            positionedLevel: 3,
            positionedScore: 30,
            obtainedLevel: UNCERTIFIED_LEVEL,

            obtainedScore: 0,
          }, {
            index: '4.4',
            area_code: '4',
            id: 'competence_4',
            name: 'Résoudre',
            obtainedLevel: 3,
            positionedLevel: 4,
            positionedScore: 40,
            obtainedScore: pixForCompetence4 - malusForFalseAnswer,
          }];

          const expectedChallenges = [
            {
              challengeId: 'challenge_A_for_competence_1',
              competence: '1.1',
              skill: '@skillChallengeA_1',
              result: 'ok',
              value: '1',
            },
            {
              challengeId: 'challenge_B_for_competence_1',
              competence: '1.1',
              skill: '@skillChallengeB_1',
              result: 'ko',
              value: '1',
            },
            {
              challengeId: 'challenge_C_for_competence_1',
              competence: '1.1',
              skill: '@skillChallengeC_1',
              result: 'ok',
              value: '1',
            },
            {
              challengeId: 'challenge_D_for_competence_2',
              competence: '2.2',
              skill: '@skillChallengeD_2',
              result: 'ok',
              value: '1',
            },
            {
              challengeId: 'challenge_E_for_competence_2',
              competence: '2.2',
              skill: '@skillChallengeE_2',
              result: 'ok',
              value: '1',
            },
            {
              challengeId: 'challenge_F_for_competence_2',
              competence: '2.2',
              skill: '@skillChallengeF_2',
              result: 'ok',
              value: '1',
            },
            {
              challengeId: 'challenge_G_for_competence_3',
              competence: '3.3',
              skill: '@skillChallengeG_3',
              result: 'ok',
              value: '1',
            },
            {
              challengeId: 'challenge_H_for_competence_3',
              competence: '3.3',
              skill: '@skillChallengeH_3',
              result: 'ko',
              value: '1',
            },
            {
              challengeId: 'challenge_I_for_competence_3',
              competence: '3.3',
              skill: '@skillChallengeI_3',
              result: 'ko',
              value: '1',
            },
            {
              challengeId: 'challenge_J_for_competence_4',
              competence: '4.4',
              skill: '@skillChallengeJ_4',
              result: 'ok',
              value: '1',
            },
            {
              challengeId: 'challenge_K_for_competence_4',
              competence: '4.4',
              skill: '@skillChallengeK_4',
              result: 'ko',
              value: '1',
            },
            {
              challengeId: 'challenge_L_for_competence_4',
              competence: '4.4',
              skill: '@skillChallengeL_4',
              result: 'ok',
              value: '1',
            },

          ];
          const expectedResult = {
            competencesWithMark: expectedCertifiedCompetences,
            listChallengesAndAnswers: expectedChallenges,
            percentageCorrectAnswers: 67,
            status: certificationAssessment.state,
            totalScore: 54,
            userId: certificationAssessment.userId,
            completedAt: certificationAssessment.completedAt,
            createdAt: certificationAssessment.createdAt,
          };

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result).to.deep.equal(expectedResult);
        });

        context('when one competence is evaluated with 3 challenges', () => {

          context('with one OK, one KO and one QROCM-dep OK', () => {

            it('should return level obtained equal to level positioned minus one', async () => {
              // Given
              const positionedLevel = 2;
              const positionedScore = 20;

              const answers = _.map([
                { challengeId: 'challenge_A_for_competence_1', result: 'ok' },
                { challengeId: 'challenge_B_for_competence_1', result: 'ok' },
                { challengeId: 'challenge_C_for_competence_1', result: 'ko' },
              ], domainBuilder.buildAnswer);

              const challenges = _.map([
                { challengeId: 'challenge_A_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeA_1' },
                { challengeId: 'challenge_B_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeB_1' },
                { challengeId: 'challenge_C_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeC_1' },
              ], domainBuilder.buildCertificationChallenge);

              const userCompetences = [
                _buildUserCompetence(competence_1, positionedScore, positionedLevel),
              ];

              certificationAssessment.certificationAnswersByDate = answers;
              certificationAssessment.certificationChallenges = challenges;
              placementProfileService.getPlacementProfile.restore();
              sinon.stub(placementProfileService, 'getPlacementProfile').withArgs({
                userId: certificationAssessment.userId,
                limitDate: certificationAssessment.createdAt,
                isV2Certification: certificationAssessment.isV2Certification,
              }).resolves({ userCompetences });

              // When
              const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

              // Then
              expect(result.competencesWithMark[0].obtainedLevel).to.deep.equal(positionedLevel - 1);
              expect(result.competencesWithMark[0].obtainedScore).to.deep.equal(positionedScore - 8);
            });

          });

        });

      });
    });

    describe('Calculate certification result when assessment is completed (stop on error)', () => {
      const continueOnError = false;

      beforeEach(() => {
        certificationAssessment.certificationAnswersByDate = wrongAnswersForAllChallenges();
        certificationAssessment.certificationChallenges = challenges;
        sinon.stub(competenceRepository, 'listPixCompetencesOnly').resolves(allPixCompetencesFromAirtable);
        sinon.stub(challengeRepository, 'findOperative').resolves(challengesFromAirTable);
        sinon.stub(placementProfileService, 'getPlacementProfile').withArgs({
          userId: certificationAssessment.userId,
          limitDate: certificationAssessment.createdAt,
          isV2Certification: certificationAssessment.isV2Certification,
        }).resolves({ userCompetences });
      });

      it('should retrieve challenges list', async () => {
        // when
        await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

        // then
        sinon.assert.calledOnce(challengeRepository.findOperative);
      });

      it('should retrieve competences list', async () => {
        // when
        await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

        // then
        sinon.assert.calledOnce(competenceRepository.listPixCompetencesOnly);
      });

      context('when reproducibility rate is < 50%', () => {

        it('should return totalScore = 0', async () => {
          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.totalScore).to.equal(0);
        });

        it('should return list of competences with all certifiedLevel at -1', async () => {
          // given
          const expectedCertifiedCompetences = [{
            index: '1.1',
            area_code: '1',
            id: 'competence_1',
            name: 'Mener une recherche',
            obtainedLevel: UNCERTIFIED_LEVEL,

            positionedLevel: 1,
            positionedScore: 10,
            obtainedScore: 0,
          }, {
            index: '2.2',
            area_code: '2',
            id: 'competence_2',
            name: 'Partager',
            obtainedLevel: UNCERTIFIED_LEVEL,

            positionedLevel: 2,
            positionedScore: 20,
            obtainedScore: 0,
          }, {
            index: '3.3',
            area_code: '3',
            id: 'competence_3',
            name: 'Adapter',
            obtainedLevel: UNCERTIFIED_LEVEL,

            positionedLevel: 3,
            positionedScore: 30,
            obtainedScore: 0,
          }, {
            index: '4.4',
            area_code: '4',
            id: 'competence_4',
            name: 'Résoudre',
            obtainedLevel: UNCERTIFIED_LEVEL,

            positionedLevel: 4,
            positionedScore: 40,
            obtainedScore: 0,
          }];

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is between 80% and 100%', () => {

        beforeEach(() => {
          certificationAssessment.certificationAnswersByDate = correctAnswersForAllChallenges();
        });

        it('should return totalScore = all pix', async () => {
          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.totalScore).to.equal(totalPix);
        });

        it('should ignore answers with no matching challenge', async () => {
          // given
          const answerNoMatchingChallenge = domainBuilder.buildAnswer({ challengeId: 'non_existing_challenge', result: 'ok' });
          certificationAssessment.certificationAnswersByDate = [...correctAnswersForAllChallenges(), answerNoMatchingChallenge ];

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.listChallengesAndAnswers.length).to.equal(correctAnswersForAllChallenges().length);
        });

        it('should return list of competences with all certifiedLevel equal to estimatedLevel', async () => {
          // given
          const expectedCertifiedCompetences = [
            {
              index: '1.1',
              area_code: '1',
              id: 'competence_1',
              name: 'Mener une recherche',
              obtainedLevel: 1,
              positionedLevel: 1,
              positionedScore: 10,
              obtainedScore: pixForCompetence1,
            }, {
              index: '2.2',
              area_code: '2',
              id: 'competence_2',
              name: 'Partager',
              obtainedLevel: 2,
              positionedLevel: 2,
              positionedScore: 20,
              obtainedScore: pixForCompetence2,
            }, {
              index: '3.3',
              area_code: '3',
              id: 'competence_3',
              name: 'Adapter',
              obtainedLevel: 3,
              positionedLevel: 3,
              positionedScore: 30,
              obtainedScore: pixForCompetence3,
            }, {
              index: '4.4',
              area_code: '4',
              id: 'competence_4',
              name: 'Résoudre',
              obtainedLevel: 4,
              positionedLevel: 4,
              positionedScore: 40,
              obtainedScore: pixForCompetence4,
            },
          ];

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });

        it('should return totalScore = (all pix - one competence pix) when one competence is totally false', async () => {
          // given
          certificationAssessment.certificationAnswersByDate = answersToHaveOnlyTheLastCompetenceFailed();

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.totalScore).to.equal(totalPix - pixForCompetence4);
        });

        it('should return list of competences with certifiedLevel = estimatedLevel except for failed competence', async () => {
          // given
          certificationAssessment.certificationAnswersByDate = answersToHaveOnlyTheLastCompetenceFailed();
          const expectedCertifiedCompetences = [{
            index: '1.1',
            area_code: '1',
            id: 'competence_1',
            name: 'Mener une recherche',
            obtainedLevel: 1,
            positionedLevel: 1,
            positionedScore: 10,
            obtainedScore: pixForCompetence1,
          }, {
            index: '2.2',
            area_code: '2',
            id: 'competence_2',
            name: 'Partager',
            obtainedLevel: 2,
            positionedLevel: 2,
            positionedScore: 20,
            obtainedScore: pixForCompetence2,
          }, {
            index: '3.3',
            area_code: '3',
            id: 'competence_3',
            name: 'Adapter',
            obtainedLevel: 3,
            positionedLevel: 3,
            positionedScore: 30,
            obtainedScore: pixForCompetence3,
          }, {
            index: '4.4',
            area_code: '4',
            id: 'competence_4',
            name: 'Résoudre',
            obtainedLevel: UNCERTIFIED_LEVEL,
            positionedLevel: 4,
            positionedScore: 40,
            obtainedScore: 0,
          }];

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when reproducibility rate is between 50% and 80%', () => {

        beforeEach(() => {
          certificationAssessment.certificationAnswersByDate = answersWithReproducibilityRateLessThan80();
        });

        it('should return totalScore = all pix minus 8 for one competence with 1 error and minus all pix for others false competences', async () => {
          // given
          const malusForFalseAnswer = 8;
          const expectedScore = totalPix - pixForCompetence3 - 2 * malusForFalseAnswer;

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.totalScore).to.equal(expectedScore);
        });

        it('should return list of competences with certifiedLevel less or equal to estimatedLevel', async () => {
          // given
          const malusForFalseAnswer = 8;
          const expectedCertifiedCompetences = [{
            index: '1.1',
            area_code: '1',
            id: 'competence_1',
            name: 'Mener une recherche',
            obtainedLevel: 0,
            positionedLevel: 1,
            positionedScore: 10,
            obtainedScore: pixForCompetence1 - malusForFalseAnswer,
          }, {
            index: '2.2',
            area_code: '2',
            id: 'competence_2',
            name: 'Partager',
            obtainedLevel: 2,
            positionedLevel: 2,
            positionedScore: 20,
            obtainedScore: pixForCompetence2,
          }, {
            index: '3.3',
            area_code: '3',
            id: 'competence_3',
            name: 'Adapter',
            obtainedLevel: UNCERTIFIED_LEVEL,
            positionedLevel: 3,
            positionedScore: 30,
            obtainedScore: 0,
          }, {
            index: '4.4',
            area_code: '4',
            id: 'competence_4',
            name: 'Résoudre',
            obtainedLevel: 3,
            positionedLevel: 4,
            positionedScore: 40,
            obtainedScore: pixForCompetence4 - malusForFalseAnswer,
          }];

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });

      });

      context('when challenges contains one QROCM-dep challenge to validate two skills', () => {
        beforeEach(() => {
          const listChallengeComp5WithOneQROCMDEPChallengeAndAnother = _.map([
            { id: 'challenge_A_for_competence_5', competenceId: 'competence_5', type: 'QCM' },
            { id: 'challenge_B_for_competence_5', competenceId: 'competence_5', type: 'QROCM-dep' },
            { id: 'challenge_A_for_competence_6', competenceId: 'competence_6', type: 'QCM' },
            { id: 'challenge_B_for_competence_6', competenceId: 'competence_6', type: 'QCM' },
            { id: 'challenge_C_for_competence_6', competenceId: 'competence_6', type: 'QCM' },
          ], domainBuilder.buildChallenge);

          const userCompetences = [
            _buildUserCompetence(competence_5, 50, 5),
            _buildUserCompetence(competence_6, 36, 3),
          ];

          const challenges = _.map([
            { challengeId: 'challenge_A_for_competence_5', competenceId: 'competence_5', associatedSkillName: '@skillChallengeA_5' },
            { challengeId: 'challenge_B_for_competence_5', competenceId: 'competence_5', associatedSkillName: '@skillChallengeB_5' },
            { challengeId: 'challenge_A_for_competence_6', competenceId: 'competence_6', associatedSkillName: '@skillChallengeA_6' },
            { challengeId: 'challenge_B_for_competence_6', competenceId: 'competence_6', associatedSkillName: '@skillChallengeB_6' },
            { challengeId: 'challenge_C_for_competence_6', competenceId: 'competence_6', associatedSkillName: '@skillChallengeC_6' },
          ], domainBuilder.buildCertificationChallenge);
          certificationAssessment.certificationChallenges = challenges;

          challengeRepository.findOperative.restore();
          placementProfileService.getPlacementProfile.restore();
          sinon.stub(challengeRepository, 'findOperative').resolves(listChallengeComp5WithOneQROCMDEPChallengeAndAnother);
          sinon.stub(placementProfileService, 'getPlacementProfile').withArgs({
            userId: certificationAssessment.userId,
            limitDate: certificationAssessment.createdAt,
            isV2Certification: certificationAssessment.isV2Certification,
          }).resolves({ userCompetences });

        });

        it('should compute the result as if QROCM-dep was two OK challenges', async () => {
          // given
          const answers = _.map([
            ({ challengeId: 'challenge_A_for_competence_5', result: 'ok' }),
            ({ challengeId: 'challenge_B_for_competence_5', result: 'ok' }),
            ({ challengeId: 'challenge_A_for_competence_6', result: 'ko' }),
            ({ challengeId: 'challenge_B_for_competence_6', result: 'ok' }),
            ({ challengeId: 'challenge_C_for_competence_6', result: 'ko' }),
          ], domainBuilder.buildAnswer);
          certificationAssessment.certificationAnswersByDate = answers;

          const expectedCertifiedCompetences = [{
            index: '5.5',
            area_code: '5',
            id: 'competence_5',
            name: 'Chercher',
            obtainedLevel: 5,
            positionedLevel: 5,
            positionedScore: 50,
            obtainedScore: 50,
          }, {
            index: '6.6',
            area_code: '6',
            id: 'competence_6',
            name: 'Trouver',
            obtainedLevel: UNCERTIFIED_LEVEL,
            positionedLevel: 3,
            positionedScore: 36,
            obtainedScore: 0,
          }];

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });

        it('should compute the result of QROCM-dep as only one OK because result is partially right', async () => {
          // given
          const answers = _.map([
            { challengeId: 'challenge_A_for_competence_5', result: 'ok' },
            { challengeId: 'challenge_B_for_competence_5', result: 'partially' },
            { challengeId: 'challenge_A_for_competence_6', result: 'ko' },
            { challengeId: 'challenge_B_for_competence_6', result: 'ok' },
            { challengeId: 'challenge_C_for_competence_6', result: 'ok' },
          ], domainBuilder.buildAnswer);
          certificationAssessment.certificationAnswersByDate = answers;

          const expectedCertifiedCompetences = [{
            index: '5.5',
            area_code: '5',
            id: 'competence_5',
            name: 'Chercher',
            obtainedLevel: 4,
            positionedLevel: 5,
            positionedScore: 50,
            obtainedScore: 42,
          }, {
            index: '6.6',
            area_code: '6',
            id: 'competence_6',
            name: 'Trouver',
            obtainedLevel: 2,
            positionedLevel: 3,
            positionedScore: 36,
            obtainedScore: 28,
          }];

          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
        });
      });

      context('when there are challenges for non-certifiable competences', () => {
        let challenges;

        beforeEach(() => {
          challenges = _.map([
            { challengeId: 'challenge_A_for_competence_1', competenceId: 'competence_1', associatedSkillName: '@skillChallengeA_1' },

            { challengeId: 'challenge_M_for_competence_5', competenceId: 'competence_5', associatedSkillName: '@skillChallengeM_5' },
            { challengeId: 'challenge_N_for_competence_6', competenceId: 'competence_6', associatedSkillName: '@skillChallengeN_6' },
          ], domainBuilder.buildCertificationChallenge);
          certificationAssessment.certificationChallenges = challenges;

          const answers = _.map([
            { challengeId: 'challenge_A_for_competence_1', result: 'ko' },

            { challengeId: 'challenge_M_for_competence_5', result: 'ok' },
            { challengeId: 'challenge_N_for_competence_6', result: 'ok' },
          ], domainBuilder.buildAnswer);
          certificationAssessment.certificationAnswersByDate = answers;
        });

        it('should not include the extra challenges when computing reproducibility', async () => {
          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(result.percentageCorrectAnswers).to.equal(0);
        });

        it('should not include the extra challenges in the result', async () => {
          // when
          const result = await certificationResultService.getCertificationResult({ certificationAssessment, continueOnError });

          // then
          expect(_.map(result.listChallengesAndAnswers, 'challengeId')).to.have.members([
            'challenge_A_for_competence_1',
          ]);
        });

      });
    });

  });

  describe('#computeAnswersSuccessRate', () => {

    context('when all answers are OK', () => {

      it('should have a success rate of 100%', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: 'ok' })];

        // when
        const reproducibilityRate = certificationResultService._computeAnswersSuccessRate(answers);

        // then
        expect(reproducibilityRate).to.equal(100);
      });
    });

    context('when all answers are KO', () => {

      it('should have a success rate of 0%', () => {
        // given
        const answers = [new Answer({ result: 'ko' }), new Answer({ result: 'ko' })];

        // when
        const reproducibilityRate = certificationResultService._computeAnswersSuccessRate(answers);

        // then
        expect(reproducibilityRate).to.equal(0);
      });
    });

    context('when the answers are a mixed of valid and wrong answers', () => {

      it('should have a success rate of 50% with 1W and 1R', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: 'ko' })];

        // when
        const reproducibilityRate = certificationResultService._computeAnswersSuccessRate(answers);

        // then
        expect(reproducibilityRate).to.equal(50);
      });

      it('should have a success rate of 33.3% with 2W and 1R', () => {
        // given
        const answers = [new Answer({ result: 'ok' }), new Answer({ result: 'aband' }), new Answer({ result: 'ko' })];

        // when
        const reproducibilityRate = certificationResultService._computeAnswersSuccessRate(answers);

        // then
        expect(reproducibilityRate).to.be.within(33.333333, 33.333334);
      });

    });
  });

});
