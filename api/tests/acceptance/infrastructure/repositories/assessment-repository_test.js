const { describe, it, expect, knex, beforeEach, afterEach } = require('../../../test-helper');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');

describe('Acceptance | Infrastructure | Repositories | assessment-repository', () => {

  describe('#findLastAssessmentsForEachCoursesByUser', () => {
    beforeEach(() => {

      return knex('assessments').insert([{
        id: 1,
        userId: 1,
        courseId: 'course_A',
        pixScore: null,
        estimatedLevel: null,
        createdAt : '2016-10-27 08:44:25'
      }, {
        id: 2,
        userId: 1,
        courseId: 'course_A',
        pixScore: 26,
        estimatedLevel: 4,
        createdAt : '2017-10-27 08:44:25'
      }, {
        id: 3,
        userId: 1,
        courseId: 'course_A',
        pixScore: null,
        estimatedLevel: null,
        createdAt : '2018-10-27 08:44:25'
      }, {
        id: 4,
        userId: 1,
        courseId: 'course_B',
        pixScore: 46,
        estimatedLevel: 5,
        createdAt : '2017-10-27 08:44:25'
      }, {
        id: 5,
        userId: 1,
        courseId: 'course_B',
        pixScore: null,
        estimatedLevel: 5,
        createdAt : '2018-10-27 08:44:25'
      }]);
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should return the user\'s assessments unique by course (and only the last ones)', () => {
      // given
      const userId = 1;

      // when
      const promise = assessmentRepository.findLastAssessmentsForEachCoursesByUser(userId);

      // then
      return promise.then(assessments => {
        expect(assessments).to.have.lengthOf(2);
        expect(assessments.map(assessment => assessment.get('id'))).to.deep.equal([3, 5]);
      });
    });
  });

  describe('#getByUserIdAndAssessmentId', () => {

    describe('when userId is provided,', () => {
      const fakeUserId = 3;
      let assessmentId;
      const assessment =
        {
          userId: fakeUserId,
          courseId: 'courseId'
        };

      beforeEach(() => {
        return knex('assessments')
          .insert(assessment)
          .then((insertedAssessment) => {
            assessmentId = insertedAssessment.shift();
          });
      });

      afterEach(() => {
        return knex('assessments').delete();
      });

      it('should fetch relative assessment ', () => {
        // when
        const promise = assessmentRepository.getByUserIdAndAssessmentId(assessmentId, fakeUserId);

        // then
        return promise.then((res) => {
          expect(res.get('id')).to.equal(assessmentId);
          expect(res.get('userId')).to.equal(fakeUserId);
        });
      });
    });

    describe('when userId is null,', () => {
      const fakeUserId = null;
      let assessmentId;
      const assessment =
        {
          userId: fakeUserId,
          courseId: 'courseId'
        };

      beforeEach(() => {
        return knex('assessments')
          .insert(assessment)
          .then((insertedAssessment) => {
            assessmentId = insertedAssessment.shift();
          });
      });

      afterEach(() => {
        return knex('assessments').delete();
      });

      it('should fetch relative assessment', () => {
        // when
        const promise = assessmentRepository.getByUserIdAndAssessmentId(assessmentId, fakeUserId);

        // then
        return promise.then((res) => {
          expect(res.get('id')).to.equal(assessmentId);
          expect(res.get('userId')).to.equal(fakeUserId);
        });
      });
    });

  });

});
