const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');

const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');
const { AssessmentEndedError } = require('../../../../lib/domain/errors');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');

describe('Integration | Repository | Certification Challenge', function() {

  describe('#save', () => {

    let certificationCourseObject;
    let certificationChallenge;

    beforeEach(() => {
      certificationCourseObject = databaseBuilder.factory.buildCertificationCourse();

      certificationChallenge = domainBuilder.buildCertificationChallenge();
      return databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('certification-challenges').delete()
        .then(() => databaseBuilder.clean());
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

    const certificationChallenges = [
      {
        challengeId: 'recn7XhSDTWo0Zzep',
        competenceId: 'recsvLz0W2ShyfD63',
        associatedSkill: '@url6',
        courseId: '1',
      }, {
        challengeId: 'rec39bDMnaVw3MyMR',
        competenceId: 'recsvLz0W2ShyfD63',
        associatedSkill: '@utiliserserv6',
        courseId: '2',
      },
    ];

    before(() => {
      return knex('certification-challenges').delete();
    });

    beforeEach(() => {
      return knex('certification-challenges').insert(certificationChallenges);
    });

    afterEach(() => {
      return knex('certification-challenges').delete();
    });

    it('should update status of the certificationCourse (and not completedAt if any date is passed)', () => {
      // given
      const courseId = '1';

      // when
      const promise = certificationChallengeRepository.findByCertificationCourseId(courseId);

      // then
      return promise
        .then((certificationChallenges) => {
          expect(certificationChallenges).to.have.lengthOf(1);

          expect(certificationChallenges[0]).to.be.an.instanceOf(CertificationChallenge);
        });
    });
  });

  describe('#findChallengesByCertificationCourseId', () => {

    const courseId = 3456789;
    const otherCourseId = 9823;
    let challenge1;
    let challenge2;
    let challenge3;

    beforeEach(async () => {

      challenge1 = domainBuilder.buildCertificationChallenge({
        id: 1,
        challengeId: 'recQuelquechose',
        courseId,
        associatedSkillName: '@brm7',
        competenceId: 'recCompetenceId1',
      });
      challenge2 = domainBuilder.buildCertificationChallenge({
        id: 2,
        challengeId: 'recAutrechose',
        courseId,
        associatedSkillName: '@twi8',
        competenceId: 'recCompetenceId2',
      });
      challenge3 = domainBuilder.buildCertificationChallenge({
        id: 3,
        challengeId: 'recQuelqueAutrechose',
        courseId: otherCourseId,
        associatedSkillName: '@twi8',
        competenceId: 'recCompetenceId2',
      });

      databaseBuilder.factory.buildCertificationCourse({ id: courseId });
      databaseBuilder.factory.buildCertificationCourse({ id: otherCourseId });

      databaseBuilder.factory.buildCertificationChallenge({
        id: challenge1.id,
        associatedSkill: challenge1.associatedSkillName,
        associatedSkillId: challenge1.associatedSkillId,
        challengeId: challenge1.challengeId,
        competenceId: challenge1.competenceId,
        courseId,
      });
      databaseBuilder.factory.buildCertificationChallenge({
        id: challenge2.id,
        associatedSkill: challenge2.associatedSkillName,
        associatedSkillId: challenge2.associatedSkillId,
        challengeId: challenge2.challengeId,
        competenceId: challenge2.competenceId,
        courseId,
      });
      databaseBuilder.factory.buildCertificationChallenge({
        id: challenge3.id,
        associatedSkill: challenge3.associatedSkillName,
        associatedSkillId: challenge3.associatedSkillId,
        challengeId: challenge3.challengeId,
        competenceId: challenge3.competenceId,
        courseId: otherCourseId,
      });

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should find all challenges related to a given courseId', () => {
      // when
      const promise = certificationChallengeRepository.findChallengesByCertificationCourseId(courseId);

      // then
      return promise.then((result) => {
        expect(result.length).to.equal(2);
        expect(result).to.deep.equal([challenge1, challenge2]);
      });
    });

    it('should return an empty array if there is no found challenges', () => {
      // when
      const promise = certificationChallengeRepository.findChallengesByCertificationCourseId('inexistantId');

      // then
      return promise.then((result) => {
        expect(result.length).to.equal(0);
      });
    });
  });

  describe('#getNonAnsweredChallengeByCourseId', () => {

    const courseId = 'courseId';
    const assessmentId = 'assessmentId';

    const challenge1 = {
      id: 1,
      challengeId: 'recChallenge1',
      courseId,
      associatedSkill: '@brm7',
      competenceId: 'recCompetenceId1',
    };
    const challenge2 = {
      id: 2,
      challengeId: 'recChallenge2',
      courseId,
      associatedSkill: '@twi8',
      competenceId: 'recCompetenceId2',
    };
    const challenge3 = {
      id: 3,
      challengeId: 'recChallenge3',
      courseId,
      associatedSkill: '@twi8',
      competenceId: 'recCompetenceId2',
    };
    const challenge4 = {
      id: 4,
      challengeId: 'recChallenge4',
      courseId: 'otherCourseId',
      associatedSkill: '@twi8',
      competenceId: 'recCompetenceId2',
    };
    const challenges = [
      challenge1,
      challenge2,
      challenge3,
      challenge4,
    ];

    const answer1 = {
      id: 1,
      challengeId: 'recChallenge1',
      value: 'Un Pancake',
      assessmentId,
    };
    const answers = [answer1];

    beforeEach(() => {
      return knex
        .insert(challenges)
        .into('certification-challenges')
        .then(() => knex('answers').insert(answers));
    });

    afterEach(() => {
      return knex
        .delete()
        .from('certification-challenges')
        .then(() => knex('answers').delete());
    });

    context('no certification challenge', () => {

      it('should reject the promise if no challenge is found', function() {
        // given
        const assessmentId = -1;
        const courseId = -1;

        // when
        const promise = certificationChallengeRepository.getNonAnsweredChallengeByCourseId(
          assessmentId, courseId,
        );

        // then
        return expect(promise).to.be.rejectedWith(AssessmentEndedError);
      });

    });

    context('there is some certification challenge(s)', () => {

      it('should return one challenge which has no answer associated', function() {
        // given

        // when
        const promise = certificationChallengeRepository.getNonAnsweredChallengeByCourseId(
          assessmentId, courseId,
        );

        // then
        return expect(promise).to.be.fulfilled
          .then((result) => {
            expect(result).to.be.instanceOf(CertificationChallenge);
          });
      });

    });
  });
});

