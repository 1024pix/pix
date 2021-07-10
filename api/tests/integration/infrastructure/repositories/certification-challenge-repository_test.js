const _ = require('lodash');
const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');
const { AssessmentEndedError } = require('../../../../lib/domain/errors');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');

describe('Integration | Repository | Certification Challenge', function() {

  describe('#saveAll', () => {

    afterEach(() => {
      return knex('certification-challenges').delete();
    });

    it('should return certification challenge object', async () => {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      await databaseBuilder.commit();

      const challengesToBeSaved = [
        domainBuilder.buildCertificationChallenge(),
        domainBuilder.buildCertificationChallenge(),
      ];
      const savedCertificationChallenges = await certificationChallengeRepository.saveAll({ certificationCourseId, certificationChallenges: challengesToBeSaved });

      // then
      expect(savedCertificationChallenges).to.have.lengthOf(2);
      savedCertificationChallenges.forEach((savedChallenge) => {
        expect(savedChallenge).to.be.an.instanceOf(CertificationChallenge);
        expect(savedChallenge).to.have.property('id').and.not.null;
        expect(savedChallenge.courseId).to.equal(certificationCourseId);
      });

      expect(_.omit(savedCertificationChallenges[0], ['id', 'courseId'])).to.deep.equal(_.omit(challengesToBeSaved[0], ['id', 'courseId']));
      expect(_.omit(savedCertificationChallenges[1], ['id', 'courseId'])).to.deep.equal(_.omit(challengesToBeSaved[1], ['id', 'courseId']));
    });

    it('should persist the index of the challenges', async () => {
      // given
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      await databaseBuilder.commit();

      const challengesToBeSaved = [
        domainBuilder.buildCertificationChallenge(),
        domainBuilder.buildCertificationChallenge(),
      ];
      await certificationChallengeRepository.saveAll({ certificationCourseId, certificationChallenges: challengesToBeSaved });

      // then
      const certificationChallengesRows = await knex('certification-challenges');
      expect(certificationChallengesRows[0].index).to.equal(1);
      expect(certificationChallengesRows[1].index).to.equal(2);
    });
  });

  describe('#getNextNonAnsweredChallengeWithIndexByCourseId', () => {

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
        const promise = certificationChallengeRepository.getNextNonAnsweredChallengeWithIndexByCourseId(
          assessmentId, certificationCourseId,
        );

        // then
        return expect(promise).to.be.rejectedWith(AssessmentEndedError);
      });

    });

    context('there is some non answered certification challenge(s)', () => {

      let certificationCourseId, assessmentId;
      const firstUnansweredChallengeId = 1;

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
            index: 1,
          });
        const firstUnansweredChallengeById =
          {
            id: firstUnansweredChallengeId,
            challengeId: 'recChallenge2',
            courseId: certificationCourseId,
            associatedSkill: '@brm24',
            competenceId: 'recCompetenceId2',
            createdAt: '2020-06-20T00:00:00Z',
            index: 2,
          };
        const secondUnansweredChallengeById =
          {
            id: firstUnansweredChallengeId + 1,
            challengeId: 'recChallenge2',
            courseId: certificationCourseId,
            associatedSkill: '@brm24',
            competenceId: 'recCompetenceId2',
            createdAt: '2020-06-21T00:00:00Z',
            index: 3,
          };

        // "Second" is inserted first as we check the order is chosen on the specified id
        databaseBuilder.factory.buildCertificationChallenge(secondUnansweredChallengeById);
        databaseBuilder.factory.buildCertificationChallenge(firstUnansweredChallengeById);
        databaseBuilder.factory.buildAnswer(
          {
            challengeId: answeredChallenge.challengeId,
            value: 'Un Pancake',
            assessmentId,
          });

        await databaseBuilder.commit();
      });

      it('should get challenges in the creation order', async () => {
        // when
        const question = await certificationChallengeRepository.getNextNonAnsweredChallengeWithIndexByCourseId(
          assessmentId, certificationCourseId,
        );

        // then
        expect(question.challenge.id).to.equal(firstUnansweredChallengeId);
        expect(question.index).to.equal(2);
      });

    });
  });
});

