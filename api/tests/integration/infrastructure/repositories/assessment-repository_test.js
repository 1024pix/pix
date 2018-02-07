const { describe, it, expect, knex, beforeEach, afterEach } = require('../../../test-helper');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Integration | Infrastructure | Repositories | assessment-repository', () => {

  describe('#get', () => {

    let assessmentIdInDb;

    context('when the assessment exists', () => {

      beforeEach(() => {
        return knex('assessments')
          .insert({
            userId: 1,
            courseId: 'course_A',
            pixScore: null,
            estimatedLevel: null,
            createdAt: '2016-10-27 08:44:25'
          })
          .then((assessmentId) => {
            assessmentIdInDb = assessmentId[0];
            return knex('answers').insert([
              {
                value: '1,4',
                result: 'ko',
                challengeId: 'challenge_1',
                assessmentId: assessmentIdInDb
              }, {
                value: '2,8',
                result: 'ko',
                challengeId: 'challenge_2',
                assessmentId: assessmentIdInDb
              },
              {
                value: '5,2',
                result: 'ko',
                challengeId: 'challenge_3'
              }
            ]);
          });
      });

      afterEach(() => {
        return knex('assessments').delete()
          .then(() => knex('answers').delete());
      });

      it('should return the assessment with the answers ', () => {
        // when
        const promise = assessmentRepository.get(assessmentIdInDb);

        // then
        return promise.then(assessment => {
          expect(assessment).to.be.an.instanceOf(Assessment);
          expect(assessment.id).to.equal(assessmentIdInDb);
          expect(assessment.courseId).to.equal('course_A');

          expect(assessment.answers).to.have.lengthOf(2);
          expect(assessment.answers[0].challengeId).to.equal('challenge_1');
          expect(assessment.answers[1].challengeId).to.equal('challenge_2');
        });
      });
    });

    context('when the assessment does not exist', () => {
      it('should return null', () => {
        // when
        const promise = assessmentRepository.get(245);

        // then
        return promise.then(assessment => {
          expect(assessment).to.equal(null);
        });
      });
    });
  });

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

        expect(assessments[0]).to.be.an.instanceOf(Assessment);
        expect(assessments[1]).to.be.an.instanceOf(Assessment);

        expect(assessments.map(assessment => assessment.id)).to.deep.equal([3, 5]);
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
          expect(res).to.be.an.instanceOf(Assessment);
          expect(res.id).to.equal(assessmentId);
          expect(res.userId).to.equal(fakeUserId);
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
          expect(res).to.be.an.instanceOf(Assessment);
          expect(res.id).to.equal(assessmentId);
          expect(res.userId).to.equal(fakeUserId);
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
    }, {
      id: 6,
      userId: JOHN,
      courseId: 'courseId1',
      pixScore: 2,
      estimatedLevel: 5,
      createdAt: '2020-10-27 08:44:25'
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
      const expectedAssessments = [
        new Assessment({
          id: 3,
          userId: JOHN,
          courseId: 'courseId1',
          estimatedLevel: 3,
          pixScore: 30,
        }),
        new Assessment({
          id: 4,
          userId: JOHN,
          courseId: 'courseId2',
          estimatedLevel: 3,
          pixScore: 37
        })
      ];

      // when
      const promise = assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(JOHN, '2019-10-27 08:44:25');

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.a.lengthOf(2);

        expect(assessments[0]).to.be.an.instanceOf(Assessment);
        expect(assessments[1]).to.be.an.instanceOf(Assessment);

        expect(assessments[0]).to.deep.contains(expectedAssessments[0]);
        expect(assessments[1]).to.deep.contains(expectedAssessments[1]);
      });
    });
  });

  describe('#save', () => {

    const JOHN = 2;
    const assessmentToBeSaved = new Assessment({
      userId: JOHN,
      courseId: 'courseId1',
      estimatedLevel: 1,
      pixScore: 10,
      createdAt: '2017-11-08 11:47:38'
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should save new assessment if not already existing', () => {
      // when
      const promise = assessmentRepository.save(assessmentToBeSaved);

      // then
      return promise.then((assessmentReturned) =>
        knex('assessments').where('id', assessmentReturned.id).first('id', 'userId', 'pixScore'))
        .then((assessmentsInDb) => {
          expect(assessmentsInDb.userId).to.equal(JOHN);
          expect(assessmentsInDb.pixScore).to.equal(assessmentToBeSaved.pixScore);
        });
    });
  });

  describe('#getByCertificationCourseId', () => {

    const assessmentInDb = {
      courseId: 'course_A',
      pixScore: 363,
      estimatedLevel: 6,
      createdAt: '2016-10-27 08:44:25'
    };

    beforeEach(() => {
      return knex('assessments').insert(assessmentInDb);
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should save new assessment if not already existing', () => {
      // when
      const promise = assessmentRepository.getByCertificationCourseId('course_A');

      // then
      return promise.then((assessmentReturned) => {
        expect(assessmentReturned).to.be.an.instanceOf(Assessment);
        expect(assessmentReturned.courseId).to.equal('course_A');
        expect(assessmentReturned.pixScore).to.equal(assessmentInDb.pixScore);
      });
    });
  });
});
