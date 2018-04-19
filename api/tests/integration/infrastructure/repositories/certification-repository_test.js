const { expect, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const Certification = require('../../../../lib/domain/models/Certification');

describe('Integration | Repository | Certification ', function() {

  describe('#findByUserId', function() {

    const JOHN_USERID = 1;
    const JANE_USERID = 2;

    const john_certificationCourse = {
      userId: JOHN_USERID,
      firstName: 'John',
      lastName: 'Doe',
      birthplace: 'Earth',
      birthdate: '24/10/1989',
      completedAt: '01/02/2003'
    };

    const jane_certificationCourse = {
      userId: JANE_USERID,
      firstName: 'Jane',
      lastName: 'Kalamity',
      birthplace: 'Earth',
      birthdate: '24/10/1989',
      completedAt: '01/02/2004'
    };

    const session = {
      certificationCenter: 'Université du Pix',
      address: '137 avenue de Bercy',
      room: 'La grande',
      examiner: 'Serge le Mala',
      date: '24/10/1989',
      time: '21:30',
      accessCode: 'ABCD12'
    };

    beforeEach(() => {
      return knex('sessions').insert(session)
        .then((listOfIds) => {
          jane_certificationCourse.sessionId = listOfIds[0];
          return knex('certification-courses').insert([jane_certificationCourse, john_certificationCourse]);
        });
    });

    afterEach(() => {
      return knex('certification-courses').delete()
        .then(() => {
          return knex('sessions').delete();
        });
    });

    it('should return a list of Certification for the specified user', function() {
      // when
      const promise = certificationRepository.findByUserId(JANE_USERID);

      // then
      return promise.then((certifications) => {
        expect(certifications).to.be.an('array');
        expect(certifications.length).to.equal(1);
        expect(certifications[0]).to.be.an.instanceOf(Certification);
        expect(certifications[0].certificationCenter).to.equal('Université du Pix');
        expect(certifications[0].date).to.equal('01/02/2004');
      });
    });
  });
});
