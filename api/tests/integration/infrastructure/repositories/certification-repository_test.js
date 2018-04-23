const { expect, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const Certification = require('../../../../lib/domain/models/Certification');

describe('Integration | Repository | Certification ', function() {

  describe('#findByUserId', function() {

    const JOHN_USERID = 1;
    const JANE_USERID = 2;
    const JOHN_CERTIFICATION_ID = 1;
    const JANE_COMPLETED_CERTIFICATION_ID = 2;
    const JANE_NOT_COMPLETED_CERTIFICATION_ID = 3;

    context('when there are no certification to return', () => {

      it('should return an empty list', function() {
        // when
        const promise = certificationRepository.findByUserId(JANE_USERID);

        // then
        return promise.then((certifications) => {
          expect(certifications).to.be.an('array').and.to.have.lengthOf(0);
        });
      });
    });

    context('when there are certifications for user', () => {

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
        state: 'completed',
      };

      const jane_completedAssessment = {
        courseId: JANE_COMPLETED_CERTIFICATION_ID,
        userId: JANE_USERID,
        type: 'CERTIFICATION',
        state: 'completed',
      };

      const jane_notCompletedAssessment = {
        courseId: JANE_NOT_COMPLETED_CERTIFICATION_ID,
        userId: JANE_USERID,
        type: 'CERTIFICATION',
        state: 'started',
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
          .then(() => {
            return knex('certification-courses').insert([john_certificationCourse, jane_certificationCourseCompleted, jane_certificationCourseNotCompleted]);
          })
          .then(() => {
            return knex('assessments').insert([john_completedAssessment, jane_completedAssessment, jane_notCompletedAssessment]);
          });
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

      it('should return a list of Certification for the specified user', function() {
        // when
        const promise = certificationRepository.findByUserId(JOHN_USERID);

        // then
        return promise.then((certifications) => {
          expect(certifications).to.be.an('array');
          expect(certifications.length).to.equal(1);
          expect(certifications[0]).to.be.an.instanceOf(Certification);
          expect(certifications[0].id).not.to.be.undefined;
          expect(certifications[0].certificationCenter).to.equal('Université du Pix');
          expect(certifications[0].date).to.equal('01/02/2003');
        });
      });

      it('should return a list of completed Certification', function() {
        // when
        const promise = certificationRepository.findByUserId(JANE_USERID);

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
});
