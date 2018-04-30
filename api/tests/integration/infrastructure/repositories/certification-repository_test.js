const { expect, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Certification = require('../../../../lib/domain/models/Certification');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Certification ', () => {

  describe('#findCertificationbyUserId', () => {

    const USER_ID = 1;

    const certificationCourse = {
      id: 123,
      userId: USER_ID,
      firstName: 'Jane',
      lastName: 'Kalamity',
      birthplace: 'Earth',
      birthdate: '24/10/1989',
      completedAt: '12/02/2000',
      sessionId: 321,
      isPublished: true
    };

    const assessmentResult = {
      level: 1,
      pixScore: 23,
      emitter: 'PIX-ALGO',
      status: 'rejected',
      assessmentId: 1000
    };

    const assessment = {
      id: 1000,
      courseId: 123,
      userId: USER_ID,
      type: 'CERTIFICATION',
      state: 'completed'
    };

    const session = {
      id: 321,
      certificationCenter: 'Université des chocolats',
      address: '137 avenue de Bercy',
      room: 'La grande',
      examiner: 'Serge le Mala',
      date: '12/02/2000',
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

    it('should return an array of Certification with needed informations', () => {
      // given
      const assessmentResult = new AssessmentResult({
        pixScore: 23,
        status: 'rejected'
      });
      const expectedCertifications = [
        new Certification({
          id: 123,
          certificationCenter: 'Université des chocolats',
          date: '12/02/2000',
          isPublished: true,
          assessmentState: 'completed',
          assessmentResults: [assessmentResult]
        })
      ];

      // when
      const promise = certificationRepository.findCertificationsByUserId(USER_ID);

      // then
      return promise.then((certifications) => {
        expect(certifications).to.deep.equal(expectedCertifications);
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
