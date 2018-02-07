const { expect, describe, beforeEach, afterEach, it, knex } = require('../../../test-helper');

const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');

const CertificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');

describe('Integration | Repository | Certification Challenge', function() {

  const certificationChallenges = [{
    challengeId: 'recn7XhSDTWo0Zzep',
    competenceId: 'recsvLz0W2ShyfD63',
    associatedSkill: '@url6',
    courseId: '1'
  }, {
    challengeId: 'rec39bDMnaVw3MyMR',
    competenceId: 'recsvLz0W2ShyfD63',
    associatedSkill: '@utiliserserv6',
    courseId: '2'
  }];

  describe('#findByCertificationCourseId', () => {

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
      const promise = CertificationChallengeRepository.findByCertificationCourseId(courseId);

      // then
      return promise
        .then((certificationChallenges) => {
          expect(certificationChallenges).to.have.lengthOf(1);

          expect(certificationChallenges[0]).to.be.an.instanceOf(CertificationChallenge);
        });
    });

  });

});

