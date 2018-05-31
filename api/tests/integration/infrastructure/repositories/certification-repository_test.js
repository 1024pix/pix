const { expect, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
const factory = require('../../../factory');

const Certification = require('../../../../lib/domain/models/Certification');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Integration | Repository | Certification ', () => {

  describe('#getCertification', () => {

    const USER_ID = 1;
    const CERTIFICATION_ID = 123;

    const session = {
      id: 321,
      certificationCenter: 'Université des chocolats',
      address: '137 avenue de Bercy',
      room: 'La grande',
      examiner: 'Serge le Mala',
      date: '12/02/2000',
      time: '21:30',
      accessCode: 'ABCD12',
    };

    const certificationCourse = {
      id: CERTIFICATION_ID,
      userId: USER_ID,
      firstName: 'Jane',
      lastName: 'Kalamity',
      birthplace: 'Earth',
      birthdate: new Date('1989-10-24'),
      completedAt: new Date('2000-02-12'),
      sessionId: session.id,
      isPublished: true,
    };

    const assessment = {
      id: 1000,
      courseId: CERTIFICATION_ID,
      userId: USER_ID,
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
    };

    const assessmentResult = {
      level: 1,
      pixScore: 23,
      emitter: 'PIX-ALGO',
      status: 'rejected',
      assessmentId: assessment.id,
      commentForCandidate: 'Comment for candidate',
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

    it('should return a certification with needed informations', () => {
      // given
      const expectedCertification = factory.buildCertification({
        id: 123,
        certificationCenter: 'Université des chocolats',
        date: new Date('2000-02-12'),
        isPublished: true,
        assessmentState: 'completed',
        birthdate: new Date('1989-10-24'),
        firstName: 'Jane',
        lastName: 'Kalamity',
        pixScore: 23,
        status: 'rejected',
        commentForCandidate: 'Comment for candidate',
        certifiedProfile: null
      });

      // when
      const promise = certificationRepository.getCertification({ id: CERTIFICATION_ID });

      // then
      return promise.then((certification) => {
        expect(certification).to.deep.equal(expectedCertification);
      });
    });

    it('should return a not found error when certification does not exist', () => {
      // given
      const NO_CERTIFICATION_ID = 999;

      // when
      const promise = certificationRepository.getCertification({ id: NO_CERTIFICATION_ID });

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

  describe('#findCertificationbyUserId', () => {

    const USER_ID = 1;

    const certificationCourse = {
      id: 123,
      userId: USER_ID,
      firstName: 'Jane',
      lastName: 'Kalamity',
      birthplace: 'Earth',
      birthdate: new Date('1989-10-24'),
      completedAt: new Date('2000-02-12'),
      sessionId: 321,
      isPublished: true,
    };

    const assessmentResult = {
      level: 1,
      pixScore: 23,
      emitter: 'PIX-ALGO',
      status: 'rejected',
      assessmentId: 1000,
      commentForCandidate: 'Comment for candidate',
    };

    const assessment = {
      id: 1000,
      courseId: 123,
      userId: USER_ID,
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
    };

    const session = {
      id: 321,
      certificationCenter: 'Université des chocolats',
      address: '137 avenue de Bercy',
      room: 'La grande',
      examiner: 'Serge le Mala',
      date: '12/02/2000',
      time: '21:30',
      accessCode: 'ABCD12',
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
      const expectedCertifications = [factory.buildCertification({
        id: 123,
        certificationCenter: 'Université des chocolats',
        date: new Date('2000-02-12'),
        isPublished: true,
        assessmentState: 'completed',
        birthdate: new Date('1989-10-24'),
        firstName: 'Jane',
        lastName: 'Kalamity',
        pixScore: 23,
        status: 'rejected',
        commentForCandidate: 'Comment for candidate',
        certifiedProfile: null,
      })];

      // when
      const promise = certificationRepository.findCertificationsByUserId(USER_ID);

      // then
      return promise.then((certifications) => {
        expect(certifications).to.deep.equal(expectedCertifications);
      });
    });
  });

  describe('#updateCertification', () => {

    const USER_ID = 1;
    const CERTIFICATION_ID = 123;

    const certificationCourse = {
      id: CERTIFICATION_ID,
      userId: USER_ID,
      firstName: 'Jane',
      lastName: 'Kalamity',
      birthplace: 'Earth',
      birthdate: new Date('1989-10-24'),
      completedAt: new Date('2000-02-12'),
      sessionId: 321,
      isPublished: true,
    };

    const assessmentResult = {
      level: 1,
      pixScore: 23,
      emitter: 'PIX-ALGO',
      status: 'rejected',
      assessmentId: 1000,
    };

    const assessment = {
      id: 1000,
      courseId: CERTIFICATION_ID,
      userId: USER_ID,
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
    };

    const session = {
      id: 321,
      certificationCenter: 'Université des chocolats',
      address: '137 avenue de Bercy',
      room: 'La grande',
      examiner: 'Serge le Mala',
      date: '12/02/2000',
      time: '21:30',
      accessCode: 'ABCD12',
    };

    beforeEach(() => {
      return knex('sessions').insert(session)
        .then(() => knex('certification-courses').insert(certificationCourse))
        .then(() => knex('assessments').insert(assessment))
        .then(() => knex('assessment-results').insert(assessmentResult));
    });

    afterEach(() => {
      return knex('assessment-results').delete()
        .then(() => knex('assessments').delete())
        .then(() => knex('certification-courses').delete())
        .then(() => knex('sessions').delete());
    });

    context('the certification does not exist', () => {

      it('should return a NotFoundError', () => {
        // given
        const NON_EXISITNG_CERTIFICATION_ID = 1203;

        // when
        const promise = certificationRepository.updateCertification({
          id: NON_EXISITNG_CERTIFICATION_ID,
          attributes: { isPublished: true },
        });

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError)
          .then(() => knex('certification-courses').where('id', NON_EXISITNG_CERTIFICATION_ID))
          .then((foundCertifications) => expect(foundCertifications).to.be.empty);
      });
    });

    context('the certification does exist', () => {

      let promise;

      beforeEach(() => {
        promise = certificationRepository.updateCertification({
          id: CERTIFICATION_ID,
          attributes: { isPublished: true },
        });
      });

      // then
      it('should update the certification', () => {

        return promise
          .then(() => knex('certification-courses').where('id', CERTIFICATION_ID))
          .then((foundCertifications) => expect(foundCertifications[0].isPublished).to.be.equal(1));
      });

      it('should return the updated certification', () => {

        const expectedCertification = factory.buildCertification({
          assessmentState: 'completed',
          certificationCenter: 'Université des chocolats',
          firstName: 'Jane',
          lastName: 'Kalamity',
          birthdate: new Date('1989-10-24'),
          date: new Date('2000-02-12'),
          id: 123,
          isPublished: true,
          pixScore: 23,
          status: 'rejected',
          commentForCandidate: null,
          certifiedProfile: null,
        });

        return promise
          .then((certification) => {
            expect(certification).to.be.an.instanceOf(Certification);
            expect(certification).to.be.deep.equal(expectedCertification);
          });
      });
    });
  });
});
