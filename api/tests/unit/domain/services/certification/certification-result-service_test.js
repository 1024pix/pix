const { expect, sinon, domainBuilder } = require('../../../../test-helper');
const _ = require('lodash');
const certificationResultService = require('../../../../../lib/domain/services/certification-result-service');

const Assessment = require('../../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');

const answersRepository = require('../../../../../lib/infrastructure/repositories/answer-repository');
const certificationChallengesRepository = require('../../../../../lib/infrastructure/repositories/certification-challenge-repository');
const certificationCourseRepository = require('../../../../../lib/infrastructure/repositories/certification-course-repository');
const challengeRepository = require('../../../../../lib/infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../../../../lib/infrastructure/repositories/competence-repository');
const userService = require('../../../../../lib/domain/services/user-service');

function _buildUserCompetence(competence, pixScore, estimatedLevel) {
  return { ...competence, estimatedLevel, pixScore, };
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
const competencesFromAirtable = [ competence_1, competence_2, competence_3, competence_4, competence_5, competence_6 ];

const userCompetences = [
  _buildUserCompetence(competence_1, pixForCompetence1, 1),
  _buildUserCompetence(competence_2, pixForCompetence2, 2),
  _buildUserCompetence(competence_3, pixForCompetence3, 3),
  _buildUserCompetence(competence_4, pixForCompetence4, 4),
];

describe('Unit | Service | Certification Result Service', function() {

  const dateCreationCertif = new Date('2018-01-01T01:02:03Z');

  describe('#getCertificationResult', () => {

    describe('Choice of profile to certify', () => {

      const certificationAssessment = new Assessment({
        id: 'assessment_id',
        userId: 'user_id',
        courseId: 'course_id',
        createdAt: dateCreationCertif,
        state: 'completed',
      });

      const certificationCourseV2 = new CertificationCourse({
        id: 'course_id',
        status: 'completed',
        createdAt: dateCreationCertif,
        isV2Certification: true
      });

      beforeEach(() => {
        sinon.stub(answersRepository, 'findByAssessment').resolves([]);
        sinon.stub(certificationChallengesRepository, 'findByCertificationCourseId').resolves([]);
        sinon.stub(certificationCourseRepository, 'get').resolves(certificationCourseV2);
        sinon.stub(competenceRepository, 'list').resolves(competencesFromAirtable);
        sinon.stub(challengeRepository, 'list').resolves(challengesFromAirTable);
        sinon.stub(userService, 'getCertificationProfile').withArgs({
          userId: certificationAssessment.userId,
          limitDate: certificationAssessment.createdAt,
          isV2Certification: certificationCourseV2.isV2Certification,
        }).resolves({ userCompetences: [] });
      });

      it('should get user profile V2', async () => {
        // when
        await certificationResultService.getCertificationResult(certificationAssessment, false);

        // then
        sinon.assert.calledOnce(userService.getCertificationProfile);

      });
    });

    describe('Compute certification result for jury (continue on error)', () => {

      const continueOnError = true;
      const certificationAssessment = new Assessment({
        id: 'assessment_id',
        userId: 'user_id',
        courseId: 'course_id',
        createdAt: dateCreationCertif,
        state: 'completed',
      });

      const certificationCourseV1 = new CertificationCourse({
        id: 'course_id',
        status: 'completed',
        completedAt: dateCreationCertif,
        isV2Certification: false
      });

      beforeEach(() => {
        sinon.stub(answersRepository, 'findByAssessment').resolves(wrongAnswersForAllChallenges());
        sinon.stub(certificationChallengesRepository, 'findByCertificationCourseId').resolves(challenges);
        sinon.stub(competenceRepository, 'list').resolves(competencesFromAirtable);
        sinon.stub(challengeRepository, 'list').resolves(challengesFromAirTable);
        sinon.stub(userService, 'getCertificationProfile').withArgs({
          userId: 'user_id',
          limitDate: dateCreationCertif,
          isV2Certification: certificationCourseV1.isV2Certification,
        }).resolves({ userCompetences });
        sinon.stub(certificationCourseRepository, 'get').resolves(certificationCourseV1);
      });

      it('should call Answers Repository to get Answers of certification', function() {
        // when
        const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(answersRepository.findByAssessment);
          sinon.assert.calledWith(answersRepository.findByAssessment, certificationAssessment.id);
        });
      });

      it('should call Certification Challenges Repository to find challenges by certification id', function() {
        // when
        const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(certificationChallengesRepository.findByCertificationCourseId);
          sinon.assert.calledWith(certificationChallengesRepository.findByCertificationCourseId, 'course_id');
        });
      });

      it('should call challenge Repository to get List', function() {
        // when
        const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(challengeRepository.list);
        });
      });

      context('when reproducibility rate is < 50%', () => {

        it('should return totalScore = 0', () => {
          // given
          answersRepository.findByAssessment.resolves(wrongAnswersForAllChallenges());

          // when
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.totalScore).to.equal(0);
          });
        });

        it('should return list of competences with all certifiedLevel at -1', () => {
          // given
          answersRepository.findByAssessment.resolves(wrongAnswersForAllChallenges());

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
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
          });
        });
      });

      context('when reproducibility rate is between 80% and 100%', () => {

        beforeEach(() => {
          answersRepository.findByAssessment.resolves(correctAnswersForAllChallenges());
        });

        it('should ignore answers with no matching challenge', function() {
          // when
          certificationChallengesRepository.findByCertificationCourseId.resolves([]);
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.totalScore).to.equal(0);
          });
        });

        it('should return totalScore = all pix', () => {
          // when
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.totalScore).to.equal(totalPix);
          });
        });

        it('should return list of competences with all certifiedLevel equal to estimatedLevel', () => {
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
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
          });
        });

        it('should return totalScore = (all pix - one competence pix) when one competence is totally false', () => {
          // given
          answersRepository.findByAssessment.resolves(answersToHaveOnlyTheLastCompetenceFailed());

          // when
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.totalScore).to.equal(totalPix - pixForCompetence4);
          });
        });

        it('should return list of competences with certifiedLevel = estimatedLevel except for failed competence', () => {
          // given
          answersRepository.findByAssessment.resolves(answersToHaveOnlyTheLastCompetenceFailed());
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
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
          });
        });
      });

      context('when reproducibility rate is between 50% and 80%', () => {
        beforeEach(() => {
          answersRepository.findByAssessment.resolves(answersWithReproducibilityRateLessThan80());
        });

        it('should return totalScore = all pix minus 8 for one competence with 1 error and minus all pix for others false competences', () => {
          // given
          const malusForFalseAnswer = 8;
          const expectedScore = totalPix - pixForCompetence3 - 2 * malusForFalseAnswer;

          // when
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.totalScore).to.equal(expectedScore);
          });
        });

        it('should return list of competences with certifiedLevel less or equal to estimatedLevel', () => {
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
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
          });
        });

        it('should return a object contains information about competences and challenges', () => {
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
            status: 'completed',
            totalScore: 54,
            userId: 'user_id',
            completedAt: dateCreationCertif,
            createdAt: dateCreationCertif,
          };

          // when
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result).to.deep.equal(expectedResult);
          });
        });

        context('when one competence is evaluated with 3 challenges', () => {

          context('with one OK, one KO and one QROCM-dep OK', () => {

            it('should return level obtained equal to level positioned minus one', function() {
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

              answersRepository.findByAssessment.resolves(answers);
              certificationChallengesRepository.findByCertificationCourseId.resolves(challenges);
              userService.getCertificationProfile.withArgs({
                userId: 'user_id',
                limitDate: dateCreationCertif,
                isV2Certification: false,
              }).resolves({ userCompetences });

              // When
              const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

              // Then
              return promise.then((result) => {
                expect(result.competencesWithMark[0].obtainedLevel).to.deep.equal(positionedLevel - 1);
                expect(result.competencesWithMark[0].obtainedScore).to.deep.equal(positionedScore - 8);
              });
            });

          });

        });

      });
    });

    describe('Calculate certification result when assessment is completed (stop on error)', () => {

      const continueOnError = false;
      const certificationCourse = new CertificationCourse({ id: 'course_id', status: 'completed' });

      const certificationAssessment = new Assessment({
        id: 'assessment_id',
        userId: 'user_id',
        createdAt: dateCreationCertif,
        courseId: 'course_id',
        status: 'completed',
      });

      beforeEach(() => {
        sinon.stub(userService, 'getCertificationProfile').withArgs({
          userId: 'user_id',
          limitDate: dateCreationCertif,
          isV2Certification: false,
        }).resolves({ userCompetences });
        sinon.stub(answersRepository, 'findByAssessment').resolves(wrongAnswersForAllChallenges());
        sinon.stub(certificationChallengesRepository, 'findByCertificationCourseId').resolves(challenges);
        sinon.stub(certificationCourseRepository, 'get').resolves(certificationCourse);
        sinon.stub(competenceRepository, 'list').resolves(competencesFromAirtable);
        sinon.stub(challengeRepository, 'list').resolves(challengesFromAirTable);
      });

      it('should call Answers Repository to get Answers of certification', function() {
        // when
        const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(answersRepository.findByAssessment);
          sinon.assert.calledWith(answersRepository.findByAssessment, certificationAssessment.id);
        });
      });

      it('should call Certification Challenges Repository to find challenges by certification id', function() {
        // when
        const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(certificationChallengesRepository.findByCertificationCourseId);
          sinon.assert.calledWith(certificationChallengesRepository.findByCertificationCourseId, 'course_id');
        });
      });

      it('should call challenge Repository to get List', function() {
        // when
        const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(challengeRepository.list);
        });
      });

      context('when reproducibility rate is < 50%', () => {

        it('should return totalScore = 0', () => {
          // given
          answersRepository.findByAssessment.resolves(wrongAnswersForAllChallenges());

          // when
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.totalScore).to.equal(0);
          });
        });

        it('should return list of competences with all certifiedLevel at -1', () => {
          // given
          answersRepository.findByAssessment.resolves(wrongAnswersForAllChallenges());

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
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
          });
        });
      });

      context('when reproducibility rate is between 80% and 100%', () => {

        beforeEach(() => {
          answersRepository.findByAssessment.resolves(correctAnswersForAllChallenges());
        });

        it('should return totalScore = all pix', () => {
          // when
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.totalScore).to.equal(totalPix);
          });
        });

        it('should ignore answers with no matching challenge', async function() {
          // given
          const matchingAnswers = correctAnswersForAllChallenges();
          const answerNoMatchingChallenge = domainBuilder.buildAnswer({ challengeId: 'non_existing_challenge', result: 'ok' });

          // when
          answersRepository.findByAssessment.resolves(matchingAnswers.concat(answerNoMatchingChallenge));
          const result = await certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          expect(result.listChallengesAndAnswers.length).to.equal(matchingAnswers.length);
        });

        it('should return list of competences with all certifiedLevel equal to estimatedLevel', () => {
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
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
          });
        });

        it('should return totalScore = (all pix - one competence pix) when one competence is totally false', () => {
          // given
          answersRepository.findByAssessment.resolves(answersToHaveOnlyTheLastCompetenceFailed());

          // when
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.totalScore).to.equal(totalPix - pixForCompetence4);
          });
        });

        it('should return list of competences with certifiedLevel = estimatedLevel except for failed competence', () => {
          // given
          answersRepository.findByAssessment.resolves(answersToHaveOnlyTheLastCompetenceFailed());
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
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
          });
        });
      });

      context('when reproducibility rate is between 50% and 80%', () => {

        beforeEach(() => {
          answersRepository.findByAssessment.resolves(answersWithReproducibilityRateLessThan80());
        });

        it('should return totalScore = all pix minus 8 for one competence with 1 error and minus all pix for others false competences', () => {
          // given
          const malusForFalseAnswer = 8;
          const expectedScore = totalPix - pixForCompetence3 - 2 * malusForFalseAnswer;

          // when
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.totalScore).to.equal(expectedScore);
          });
        });

        it('should return list of competences with certifiedLevel less or equal to estimatedLevel', () => {
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
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
          });
        });

      });

      context('when challenges contains one QROCM-dep challenge to validate two skills', () => {
        beforeEach(() => {
          const listChallengeComp5WithOneQROCMDEPChallengeAndAnother = _.map([
            { id: 'challenge_A_for_competence_5', competenceId: 'competence_5', type: 'QCM' },
            { id: 'challenge_B_for_competence_5', competenceId: 'competence_5', type: 'QROCM-dep' },
            { id: 'challenge_A_for_competence_6', competenceId: 'competence_6', type: 'QCM' },
            { id: 'challenge_B_for_competence_6', competenceId: 'competence_6', type: 'QCM' },
            { id: 'challenge_C_for_competence_6', competenceId: 'competence_6', type: 'QCM' }
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

          challengeRepository.list.resolves(listChallengeComp5WithOneQROCMDEPChallengeAndAnother);
          certificationChallengesRepository.findByCertificationCourseId.resolves(challenges);
          userService.getCertificationProfile.withArgs({
            userId: 'user_id',
            limitDate: dateCreationCertif,
            isV2Certification: false,
          }).resolves({ userCompetences });

        });

        it('should compute the result as if QROCM-dep was two OK challenges', function() {
          // given
          const answers = _.map([
            ({ challengeId: 'challenge_A_for_competence_5', result: 'ok' }),
            ({ challengeId: 'challenge_B_for_competence_5', result: 'ok' }),
            ({ challengeId: 'challenge_A_for_competence_6', result: 'ko' }),
            ({ challengeId: 'challenge_B_for_competence_6', result: 'ok' }),
            ({ challengeId: 'challenge_C_for_competence_6', result: 'ko' }),
          ], domainBuilder.buildAnswer);

          answersRepository.findByAssessment.resolves(answers);

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
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
          });
        });

        it('should compute the result of QROCM-dep as only one OK because result is partially right', function() {
          // given
          const answers = _.map([
            { challengeId: 'challenge_A_for_competence_5', result: 'ok' },
            { challengeId: 'challenge_B_for_competence_5', result: 'partially' },
            { challengeId: 'challenge_A_for_competence_6', result: 'ko' },
            { challengeId: 'challenge_B_for_competence_6', result: 'ok' },
            { challengeId: 'challenge_C_for_competence_6', result: 'ok' },
          ], domainBuilder.buildAnswer);
          answersRepository.findByAssessment.resolves(answers);

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
          const promise = certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          return promise.then((result) => {
            expect(result.competencesWithMark).to.deep.equal(expectedCertifiedCompetences);
          });
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

          certificationChallengesRepository.findByCertificationCourseId.resolves(challenges);

          const answers = _.map([
            { challengeId: 'challenge_A_for_competence_1', result: 'ko' },

            { challengeId: 'challenge_M_for_competence_5', result: 'ok' },
            { challengeId: 'challenge_N_for_competence_6', result: 'ok' },
          ], domainBuilder.buildAnswer);

          answersRepository.findByAssessment.resolves(answers);
        });

        it('should not include the extra challenges when computing reproducibility', async () => {
          // when
          const { percentageCorrectAnswers } = await certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          expect(percentageCorrectAnswers).to.equal(0);
        });

        it('should not include the extra challenges in the result', async () => {
          // when
          const { listChallengesAndAnswers } = await certificationResultService.getCertificationResult(certificationAssessment, continueOnError);

          // then
          expect(_.map(listChallengesAndAnswers, 'challengeId')).to.have.members([
            'challenge_A_for_competence_1',
          ]);
        });

      });
    });

  });

});
