const { expect, knex, factory, databaseBuilder } = require('../../../test-helper');

const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');
const certificationChallengeRepository = require(
  '../../../../lib/infrastructure/repositories/certification-challenge-repository');

describe('Integration | Repository | Certification Challenge', function() {

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

    beforeEach(() => {

      challenge1 = factory.buildCertificationChallenge({
        id: 1,
        challengeId: 'recQuelquechose',
        courseId,
        associatedSkillName: '@brm7',
        competenceId: 'recCompetenceId1',
      });
      challenge2 = factory.buildCertificationChallenge({
        id: 2,
        challengeId: 'recAutrechose',
        courseId,
        associatedSkillName: '@twi8',
        competenceId: 'recCompetenceId2',
      });
      challenge3 = factory.buildCertificationChallenge({
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

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
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
});

