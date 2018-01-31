const { expect, describe, beforeEach, afterEach, it, knex } = require('../../../test-helper');
const CertificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Certification Course', function() {

  const associatedAssessment = {
    id: 7,
    courseId: 20,
    userId: 1
  };

  const certificationCourse = {
    id: 20,
    status: 'started',
    userId: 1,
    completedAt: null
  };

  const certificationChallenges = [
    {
      id: 1,
      courseId: 20,
      challengeId: 'recChallenge1'
    },
    {
      id: 2,
      courseId: 20,
      challengeId: 'recChallenge2'
    },
    {
      id: 3,
      courseId: 19,
      challengeId: 'recChallenge3'
    }
  ];

  describe('#updateStatus', () => {

    beforeEach(() => {
      return knex('certification-courses').insert(certificationCourse);
    });

    afterEach(() => {
      return knex('certification-courses').delete();
    });

    it('should update status of the certificationCourse (and not completedAt if any date is passed)', () => {
      // when
      const promise = CertificationCourseRepository.updateStatus('completed', 20);

      // then
      return promise.then(() => knex('certification-courses').first('id', 'status', 'completedAt'))
        .then((certificationCourse) => {
          expect(certificationCourse.status).to.equal('completed');
          expect(certificationCourse.completedAt).to.equal(null);
        });
    });

    it('should update status and completedAt of the certificationCourse if one date is passed', () => {
      // when
      const promise = CertificationCourseRepository.updateStatus('completed', 20, '2018-01-01');

      // then
      return promise.then(() => knex('certification-courses').first('id', 'status', 'completedAt'))
        .then((certificationCourse) => {
          expect(certificationCourse.status).to.equal('completed');
          expect(certificationCourse.completedAt).to.equal('2018-01-01');
        });
    });
  });

  describe('#get', function() {

    beforeEach(() => {
      return Promise.all([
        knex('certification-courses').insert(certificationCourse),
        knex('assessments').insert(associatedAssessment),
        knex('certification-challenges').insert(certificationChallenges),
      ]);
    });

    afterEach(() => {
      return Promise.all([
        knex('certification-courses').delete(),
        knex('assessments').delete(),
        knex('certification-challenges').delete()
      ]);
    });

    context('When the certification course exists', () => {
      it('should retrieve associated assessment with the certification course', function() {
        // when
        const promise = CertificationCourseRepository.get(20);

        // then
        return promise.then((certificationCourse) => {
          expect(certificationCourse.id).to.equal(20);
          expect(certificationCourse.status).to.equal('started');
          expect(certificationCourse.type).to.equal('CERTIFICATION');
          expect(certificationCourse.completedAt).to.equal(null);
          expect(certificationCourse.assessment.id).to.equal(7);
          expect(certificationCourse.challenges.length).to.equal(2);
        });
      });
    });
    
    context('When the certification course does not exist', () => {
      it('should retrieve a NotFoundError Error', function() {
        // when
        const promise = CertificationCourseRepository.get(4);

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });

  });
});

