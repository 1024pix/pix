const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const _ = require('lodash');

const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');
const { AssessmentEndedError } = require('../../../../lib/domain/errors');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');

describe('Integration | Repository | Certification Challenge', function() {

  describe('#save', () => {

    let certificationCourseObject;
    let certificationChallenge;

    beforeEach(async () => {
      certificationCourseObject = databaseBuilder.factory.buildCertificationCourse();

      certificationChallenge = domainBuilder.buildCertificationChallenge();
      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-challenges').delete();
    });

    it('should return certification challenge object', () => {
      const promise = certificationChallengeRepository.save(certificationChallenge, certificationCourseObject);

      // then
      return promise.then((savedCertificationChallenge) => {
        expect(savedCertificationChallenge.challengeId).to.deep.equal(certificationChallenge.id);
      });
    });
  });

  describe('#findByCertificationCourseId', () => {

    let certificationCourseId, unusedCertificationCourseId;
    beforeEach(async () => {
      // given
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({}).id;
      unusedCertificationCourseId = databaseBuilder.factory.buildCertificationCourse({}).id;
      databaseBuilder.factory.buildCertificationChallenge(
        {
          challengeId: 'chal123ABC',
          competenceId: 'comp456DEF',
          associatedSkill: '@url6',
          certificationCourseId,
        });
      databaseBuilder.factory.buildCertificationChallenge({ certificationCourseId });
      databaseBuilder.factory.buildCertificationChallenge(
        {
          challengeId: 'chal789GHI',
          competenceId: 'compIUO159',
          associatedSkill: '@utiliserserv6',
        });

      await databaseBuilder.commit();
    });

    it('should find all challenges related to a given certification courseId', async () => {
      // when
      const certificationChallenges = await certificationChallengeRepository.findByCertificationCourseId(certificationCourseId);
      const sortedCertificationChallenges = _.sortBy(certificationChallenges, [(chall) => { return chall.id; }]);

      // then
      expect(sortedCertificationChallenges).to.have.lengthOf(2);
      expect(sortedCertificationChallenges[0]).to.be.an.instanceOf(CertificationChallenge);
      expect(sortedCertificationChallenges[0].challengeId).to.equal('chal123ABC');
    });

    it('should return an empty array if there is no found challenges', async () => {
      // when
      const certificationChallenges = await certificationChallengeRepository.findByCertificationCourseId(unusedCertificationCourseId);

      // then
      expect(certificationChallenges.length).to.equal(0);
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
            certificationCourseId,
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
            certificationCourseId,
            associatedSkill: '@brm7',
            competenceId: 'recCompetenceId1',
          });
        unansweredChallenge =
          {
            challengeId: 'recChallenge2',
            certificationCourseId,
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

