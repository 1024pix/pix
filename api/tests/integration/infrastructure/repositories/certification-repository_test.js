const { expect, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const Certification = require('../../../../lib/domain/models/Certification');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Certification ', () => {

  describe('#findCompletedCertificationsByUserId', () => {

    const JOHN_USERID = 1;
    const JANE_USERID = 2;
    const JOHN_CERTIFICATION_ID = 1;
    const JANE_COMPLETED_CERTIFICATION_ID = 2;
    const JANE_NOT_COMPLETED_CERTIFICATION_ID = 3;

    context('when there are no certification to return', () => {

      it('should return an empty list', () => {
        // when
        const promise = certificationRepository.findCompletedCertificationsByUserId(JANE_USERID);

        // then
        return promise.then((certifications) => {
          expect(certifications).to.be.an('array').and.to.have.lengthOf(0);
        });
      });
    });

    context('when there are certifications in different states and for multiple users', () => {

      const john_certificationCourse = {
        id: JOHN_CERTIFICATION_ID,
        userId: JOHN_USERID,
        firstName: 'John',
        lastName: 'Doe',
        birthplace: 'Earth',
        birthdate: '24/10/1989',
        completedAt: '01/02/2003',
        sessionId: 1
      };

      const jane_certificationCourseCompleted = {
        id: JANE_COMPLETED_CERTIFICATION_ID,
        userId: JANE_USERID,
        firstName: 'Jane',
        lastName: 'Kalamity',
        birthplace: 'Earth',
        birthdate: '24/10/1989',
        completedAt: '01/02/2004',
        sessionId: 1
      };

      const jane_certificationCourseNotCompleted = {
        id: JANE_NOT_COMPLETED_CERTIFICATION_ID,
        userId: JANE_USERID,
        firstName: 'Jane',
        lastName: 'Kalamity',
        birthplace: 'Earth',
        birthdate: '24/10/1989',
        completedAt: '01/02/2004',
        sessionId: 2
      };

      const john_completedAssessment = {
        courseId: JOHN_CERTIFICATION_ID,
        userId: JOHN_USERID,
        type: 'CERTIFICATION',
        state: 'completed'
      };

      const jane_completedAssessment = {
        courseId: JANE_COMPLETED_CERTIFICATION_ID,
        userId: JANE_USERID,
        type: 'CERTIFICATION',
        state: 'completed'
      };

      const jane_notCompletedAssessment = {
        courseId: JANE_NOT_COMPLETED_CERTIFICATION_ID,
        userId: JANE_USERID,
        type: 'CERTIFICATION',
        state: 'started'
      };

      const session = {
        id: 1,
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
          .then(() => knex('certification-courses').insert([john_certificationCourse, jane_certificationCourseCompleted, jane_certificationCourseNotCompleted]))
          .then(() => knex('assessments').insert([john_completedAssessment, jane_completedAssessment, jane_notCompletedAssessment]));
      });

      afterEach(() => {
        return knex('assessments').delete()
          .then(() => {
            return knex('certification-courses').delete();
          })
          .then(() => {
            return knex('sessions').delete();
          });
      });

      it('should return a list of the completed Certifications for the specified user', () => {
        // when
        const promise = certificationRepository.findCompletedCertificationsByUserId(JANE_USERID);

        // then
        return promise.then((certifications) => {
          expect(certifications).to.be.an('array');
          expect(certifications.length).to.equal(1);
          expect(certifications[0]).to.be.an.instanceOf(Certification);
          expect(certifications[0].id).not.to.be.undefined;
          expect(certifications[0].certificationCenter).to.equal('Université du Pix');
          expect(certifications[0].date).to.equal('01/02/2004');
        });
      });
    });
  });

  describe('#findCertificationbyUserId', function() {

    const USER_ID = 1;

    const certificationCourse = {
      id: 123,
      userId: USER_ID,
      firstName: 'Jane',
      lastName: 'Kalamity',
      birthplace: 'Earth',
      birthdate: '24/10/1989',
      completedAt: '01/02/2004',
      sessionId: 321
    };

    const assessmentResult = {
      level: 1,
      pixScore: 62,
      emitter: 'PIX-ALGO',
      status: 'validated'
    };

    const assessment = {
      courseId: 123,
      userId: USER_ID,
      type: 'CERTIFICATION',
      state: 'completed'
    };

    const session = {
      id: 321,
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
        .then(() => knex('certification-courses').insert(certificationCourse))
        .then(() => knex('assessments').insert(assessment))
        .then(() => knex('assessment-results').insert(assessmentResult));
    });

    afterEach(() => {
      return knex('assessment-results').delete()
        .then(() => {
          return knex('assessments').delete();
        })
        .then(() => {
          return knex('certification-courses').delete();
        })
        .then(() => {
          return knex('sessions').delete();
        });
    });

    it('should return an array of Certification with needed informations', function() {
      // given
      const expectedCertifications = [
        new Certification({
          id: 2,
          certificationCenter: 'Université des chocolats',
          date: '12/02/1993',
          isPublished: true,
          status: 'rejected',
          pixScore: 23
        })
      ];

      // when
      const promise = certificationRepository.findCertificationsByUserId(USER_ID);

      // then
      return promise.then((certifications) => {
        expect(certifications).to.be.an(expectedCertifications);
      });

    });
  });

  describe('#updateCertification', () => {

    const CERTIFICATION_ID = 1;
    const certificationCourse = {
      id: CERTIFICATION_ID,
      userId: 1,
      firstName: 'John',
      lastName: 'Doe',
      birthplace: 'Earth',
      birthdate: '24/10/1989',
      completedAt: '01/02/2003',
      sessionId: 1,
      isPublished: false
    };

    beforeEach(() => {
      return knex('certification-courses').insert([certificationCourse]);
    });

    afterEach(() => {
      return knex('certification-courses').delete();
    });

    context('the certification does not exist', () => {

      it('should return a NotFoundError', () => {
        // given
        const NON_EXISITNG_CERTIFICATION_ID = 123;

        // when
        const promise = certificationRepository.updateCertification({
          id: NON_EXISITNG_CERTIFICATION_ID,
          attributes: { isPublished: true }
        });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError)
          .then(() => knex('certification-courses').where('id', NON_EXISITNG_CERTIFICATION_ID))
          .then((foundCertifications) => expect(foundCertifications).to.be.empty);
      });
    });

    context('the certification does exist', () => {

      it('should update the certification', () => {
        // when
        const promise = certificationRepository.updateCertification({
          id: CERTIFICATION_ID,
          attributes: { isPublished: true }
        });

        // then
        return promise
          .then(() => knex('certification-courses').where('id', CERTIFICATION_ID))
          .then((foundCertifications) => expect(foundCertifications[0].isPublished).to.be.equal(1));
      });
    });
  });
});
