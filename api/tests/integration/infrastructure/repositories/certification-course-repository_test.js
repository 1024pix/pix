const { expect, describe, beforeEach, afterEach, it, knex } = require('../../../test-helper');
const CertificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');

describe('Integration | Repository | Certification Course', function() {

  const associatedAssessment = {
    id: 7,
    courseId: 20,
    userId: 1
  };

  const certificationCourse = {
    id: 20,
    status: 'started',
    userId: 1
  };

  describe('#updateStatus', () => {

    beforeEach(() => {
      return knex('certification-courses').insert(certificationCourse);
    });

    afterEach(() => {
      return knex('certification-courses').delete();
    });

    it('should update status of the certificationCourse', () => {
      // when
      const promise = CertificationCourseRepository.updateStatus('completed', 20);

      // then
      return promise.then(() => knex('certification-courses').first('id', 'status'))
        .then((certificationCourse) => {
          expect(certificationCourse.status).to.equal('completed');
        });
    });
  });

  describe('#get', function() {

    beforeEach(() => {
      return Promise.all([
        knex('certification-courses').insert(certificationCourse),
        knex('assessments').insert(associatedAssessment),
      ]);
    });

    afterEach(() => {
      return Promise.all([
        knex('certification-courses').delete(),
        knex('assessments').delete(),
      ]);
    });

    it('should retrieve associated assessment with the certification course', function() {
      // when
      const promise = CertificationCourseRepository.get(20);

      // then
      return promise.then((certificationCourse) => {
        expect(certificationCourse.id).to.equal(20);
        expect(certificationCourse.status).to.equal('started');
        expect(certificationCourse.assessment.id).to.equal(7);
      });
    });

  });
});

