const { describe, it, beforeEach, afterEach, expect, knex } = require('../../../test-helper');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');

describe('Acceptance | Infrastructure | Repositories | assessment-repository', () => {

  beforeEach(() => {

    return knex('assessments').insert([{
      id: 1,
      userId: 1,
      courseId: 'course_A',
      pixScore: null,
      estimatedLevel: null
    }, {
      id: 2,
      userId: 1,
      courseId: 'course_A',
      pixScore: 26,
      estimatedLevel: 4
    }, {
      id: 3,
      userId: 1,
      courseId: 'course_A',
      pixScore: null,
      estimatedLevel: null
    }, {
      id: 4,
      userId: 1,
      courseId: 'course_B',
      pixScore: 46,
      estimatedLevel: 5
    }, {
      id: 5,
      userId: 1,
      courseId: 'course_B',
      pixScore: null,
      estimatedLevel: 5
    }]);
  });

  afterEach(() => {
    return knex('assessments').delete();
  });

  describe('#findCompletedAssessmentsByUserId', () => {

    it('should return only user assessments that he has completed (i.e. with a level and a score)', () => {
      // given
      const userId = 1;

      // when
      const promise = assessmentRepository.findCompletedAssessmentsByUserId(userId);

      // then
      return promise.then(assessments => {
        expect(assessments).to.have.lengthOf(2);
        expect(assessments.map(assessment => assessment.id)).to.deep.equal([2, 4]);
      });
    });
  });

});
