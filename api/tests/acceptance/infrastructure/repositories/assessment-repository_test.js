const { describe, it, expect, knex, beforeEach, afterEach } = require('../../../test-helper');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const Assessment = require('../../../../lib/domain/models/data/assessment');

describe('Acceptance | Infrastructure | Repositories | assessment-repository', () => {

  describe('#findLastAssessmentsForEachCoursesByUser', () => {
    beforeEach(() => {

      return knex('assessments').insert([{
        id: 1,
        userId: 1,
        courseId: 'course_A',
        pixScore: null,
        estimatedLevel: null,
        createdAt: '2016-10-27 08:44:25'
      }, {
        id: 2,
        userId: 1,
        courseId: 'course_A',
        pixScore: 26,
        estimatedLevel: 4,
        createdAt: '2017-10-27 08:44:25'
      }, {
        id: 3,
        userId: 1,
        courseId: 'course_A',
        pixScore: null,
        estimatedLevel: null,
        createdAt: '2018-10-27 08:44:25'
      }, {
        id: 4,
        userId: 1,
        courseId: 'course_B',
        pixScore: 46,
        estimatedLevel: 5,
        createdAt: '2017-10-27 08:44:25'
      }, {
        id: 5,
        userId: 1,
        courseId: 'course_B',
        pixScore: null,
        estimatedLevel: 5,
        createdAt: '2018-10-27 08:44:25'
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

  describe('#findLastCompletedAssessmentsByUser', () => {
    const JOHN = 2;
    const LAYLA = 3;

    const assessmentsInDb = [{
      id: 1,
      userId: JOHN,
      courseId: 'courseId1',
      estimatedLevel: 1,
      pixScore: 10,
      createdAt: '2017-11-08 11:47:38'
    }, {
      id: 2,
      userId: LAYLA,
      courseId: 'courseId1',
      estimatedLevel: 2,
      pixScore: 20,
      createdAt: '2017-11-08 11:47:38'
    }, {
      id: 3,
      userId: JOHN,
      courseId: 'courseId1',
      estimatedLevel: 3,
      pixScore: 30,
      createdAt: '2017-11-08 12:47:38'
    }, {
      id: 4,
      userId: JOHN,
      courseId: 'courseId2',
      estimatedLevel: 3,
      pixScore: 37,
      createdAt: '2017-11-08 11:47:38'
    }, {
      id: 5,
      userId: JOHN,
      courseId: 'courseId3',
      estimatedLevel: null,
      pixScore: null,
      createdAt: '2017-11-08 11:47:38'
    }
    ];

    before(() => {
      return knex('assessments').insert(assessmentsInDb);
    });

    after(() => {
      return knex('assessments').delete();
    });

    it('should correctly query Assessment conditions', () => {
      // given
      const expectedAssessments = new Assessment([
        {
          id: 3,
          userId: JOHN,
          courseId: 'courseId1',
          estimatedLevel: 3,
          pixScore: 30,
        },
        {
          id: 4,
          userId: JOHN,
          courseId: 'courseId2',
          estimatedLevel: 3,
          pixScore: 37
        }
      ]);

      // when
      const promise = assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(JOHN);

      // then
      return promise.then((assessements) => {
        expect(assessements.length).to.equal(2);
        const assessmentInJson = assessements.map(assessment => assessment.toJSON());
        expect(assessmentInJson[0]).to.contains(expectedAssessments.get(0));
        expect(assessmentInJson[1]).to.contains(expectedAssessments.get(1));
      });
    });
  });
});
