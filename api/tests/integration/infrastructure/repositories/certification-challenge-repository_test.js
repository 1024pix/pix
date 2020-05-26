const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');

const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');
const { AssessmentEndedError } = require('../../../../lib/domain/errors');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');

describe('Integration | Repository | Certification Challenge', function() {

  describe('#save', () => {

    let certificationChallenge;

    beforeEach(async () => {
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;

      certificationChallenge = domainBuilder.buildCertificationChallenge({ courseId: certificationCourseId });
      certificationChallenge.id = undefined;
      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-challenges').delete();
    });

    it('should return certification challenge object', async () => {
      const savedCertificationChallenge = await certificationChallengeRepository.save({ certificationChallenge });

      // then
      expect(savedCertificationChallenge).to.be.an.instanceOf(CertificationChallenge);
      expect(savedCertificationChallenge).to.have.property('id').and.not.null;
      expect(savedCertificationChallenge.challengeId).to.equal(certificationChallenge.challengeId);
    });
  });

  describe('#getNonAnsweredChallengeByCourseId', () => {

    context('no non answered certification challenge', () => {

      let certificationCourseId, assessmentId;
      before(async () => {
        // given
        const userId = databaseBuilder.factory.buildUser({}).id;
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        assessmentId = databaseBuilder.factory.buildAssessment({ userId, certificationCourseId }).id;
        const challenge = databaseBuilder.factory.buildCertificationChallenge(
          {
            challengeId: 'recChallenge1',
            courseId: certificationCourseId,
            associatedSkill: '@brm7',
            competenceId: 'recCompetenceId1',
          });
        databaseBuilder.factory.buildAnswer(
          {
            challengeId: challenge.challengeId,
            value: 'Un Pancake',
            assessmentId,
          });

        await databaseBuilder.commit();
      });

      it('should reject the promise if no non answered challenge is found', function() {
        // when
        const promise = certificationChallengeRepository.getNonAnsweredChallengeByCourseId(
          assessmentId, certificationCourseId,
        );

        // then
        return expect(promise).to.be.rejectedWith(AssessmentEndedError);
      });

    });

    context('there is some non answered certification challenge(s)', () => {

      let certificationCourseId, assessmentId;
      let unansweredChallenge;
      before(async () => {
        // given
        const userId = databaseBuilder.factory.buildUser({}).id;
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        assessmentId = databaseBuilder.factory.buildAssessment({ userId, certificationCourseId }).id;
        const answeredChallenge = databaseBuilder.factory.buildCertificationChallenge(
          {
            challengeId: 'recChallenge1',
            courseId: certificationCourseId,
            associatedSkill: '@brm7',
            competenceId: 'recCompetenceId1',
          });
        unansweredChallenge =
          {
            challengeId: 'recChallenge2',
            courseId: certificationCourseId,
            associatedSkill: '@brm24',
            competenceId: 'recCompetenceId2',
          };
        databaseBuilder.factory.buildCertificationChallenge(unansweredChallenge);
        databaseBuilder.factory.buildAnswer(
          {
            challengeId: answeredChallenge.challengeId,
            value: 'Un Pancake',
            assessmentId,
          });

        await databaseBuilder.commit();
      });

      it('should return one challenge which has no answer associated', async () => {
        // when
        const nonAnsweredChallenge = await certificationChallengeRepository.getNonAnsweredChallengeByCourseId(
          assessmentId, certificationCourseId,
        );

        // then
        expect(nonAnsweredChallenge).to.be.instanceOf(CertificationChallenge);
      });

    });
  });
});

