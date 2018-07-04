const { expect, knex } = require('../../../test-helper');
const _ = require('lodash');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const Answer = require('../../../../lib/domain/models/Answer');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Integration | Infrastructure | Repositories | assessment-repository', () => {

  // TODO: rajouter la verif de l'ajout du profile dans le cas du SMART_PLACEMENT
  describe('#get', () => {

    let assessmentIdInDb;

    context('when the assessment exists', () => {

      beforeEach(() => {
        return knex('assessments')
          .insert({
            userId: 1,
            courseId: 'course_A',
            state: 'completed',
            createdAt: '2016-10-27 08:44:25',
          })
          .then((assessmentId) => {
            assessmentIdInDb = assessmentId[0];
            return knex('answers').insert([
              {
                value: '1,4',
                result: 'ko',
                challengeId: 'challenge_1_4',
                assessmentId: assessmentIdInDb,
                createdAt: '2016-10-27 08:45:00',
              }, {
                value: '2,8',
                result: 'ko',
                challengeId: 'challenge_2_8',
                assessmentId: assessmentIdInDb,
                createdAt: '2016-10-27 08:45:30',
              }, {
                value: '3,1',
                result: 'ko',
                challengeId: 'challenge_3_1',
                assessmentId: assessmentIdInDb,
                createdAt: '2016-10-27 08:44:00',
              },
              {
                value: '5,2',
                result: 'ko',
                challengeId: 'challenge_4',
                createdAt: '2016-10-27 08:45:50',
              },
            ]);
          });
      });

      afterEach(() => {
        return knex('assessments').delete()
          .then(() => knex('answers').delete());
      });

      it('should return the assessment with the answers sorted by creation date ', () => {
        // when
        const promise = assessmentRepository.get(assessmentIdInDb);

        // then
        return promise.then(assessment => {
          expect(assessment).to.be.an.instanceOf(Assessment);
          expect(assessment.id).to.equal(assessmentIdInDb);
          expect(assessment.courseId).to.equal('course_A');

          expect(assessment.answers).to.have.lengthOf(3);
          expect(assessment.answers[0]).to.be.an.instanceOf(Answer);
          expect(assessment.answers[0].challengeId).to.equal('challenge_3_1');
          expect(assessment.answers[1].challengeId).to.equal('challenge_1_4');
          expect(assessment.answers[2].challengeId).to.equal('challenge_2_8');
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
        state: 'started',
        createdAt: '2016-10-27 08:44:25',
      }, {
        id: 2,
        userId: 1,
        courseId: 'course_A',
        state: 'completed',
        createdAt: '2017-10-27 08:44:25',
      }, {
        id: 3,
        userId: 1,
        courseId: 'course_A',
        state: 'started',
        createdAt: '2018-10-27 08:44:25',
      }, {
        id: 4,
        userId: 1,
        courseId: 'course_B',
        state: 'completed',
        createdAt: '2017-10-27 08:44:25',
      }, {
        id: 5,
        userId: 1,
        courseId: 'course_B',
        state: 'completed',
        createdAt: '2018-10-27 08:44:25',
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
          courseId: 'courseId',
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
          courseId: 'courseId',
        };

      beforeEach(() => {
        return knex('assessments')
          .insert(assessment)
          .returning('id')
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

  describe('#findLastCompletedAssessmentsForEachCoursesByUser', () => {
    const JOHN = 2;
    const LAYLA = 3;

    const assessmentsInDb = [{
      id: 1,
      userId: JOHN,
      courseId: 'courseId1',
      state: 'completed',
      createdAt: '2017-11-08 11:47:38',
    }, {
      id: 2,
      userId: LAYLA,
      courseId: 'courseId1',
      state: 'completed',
      createdAt: '2017-11-08 11:47:38',
    }, {
      id: 3,
      userId: JOHN,
      courseId: 'courseId1',
      state: 'completed',
      createdAt: '2017-11-08 12:47:38',
    }, {
      id: 4,
      userId: JOHN,
      courseId: 'courseId2',
      state: 'completed',
      createdAt: '2017-11-08 11:47:38',
    }, {
      id: 5,
      userId: JOHN,
      courseId: 'courseId3',
      state: 'started',
      createdAt: '2017-11-08 11:47:38',
    }, {
      id: 6,
      userId: JOHN,
      courseId: 'courseId1',
      state: 'completed',
      createdAt: '2020-10-27 08:44:25',
    },
    ];

    const assessmentResultsInDb = [{
      id: 1,
      assessmentId: 1,
      createdAt: '2018-10-27 08:44:25',
      emitter: 'PIX',
      status: 'validated',
    }, {
      id: 3,
      assessmentId: 3,
      createdAt: '2019-08-27 08:44:25',
      emitter: 'PIX',
      status: 'validated',
    }, {
      id:4,
      assessmentId: 4,
      createdAt: '2020-10-27 08:44:25',
      emitter: 'PIX',
      status: 'validated',
    }
    ];

    before(() => {
      return knex('assessments').insert(assessmentsInDb)
        .then(() => knex('assessment-results').insert(assessmentResultsInDb));
    });

    after(() => {
      return knex('assessment-results').delete()
        .then(() => knex('assessments').delete());
    });

    it('should correctly query Assessment conditions', () => {
      // given
      const expectedAssessments = [
        Assessment.fromAttributes({
          id: 3,
          userId: JOHN,
          courseId: 'courseId1',
          state: 'completed',
          createdAt: '2017-11-08 12:47:38',
          type: null,
          assessmentResults: [
            {
              assessmentId: 3,
              commentForCandidate: null,
              commentForJury: null,
              commentForOrganization: null,
              createdAt: '2019-08-27 08:44:25',
              emitter: 'PIX',
              id: 3,
              juryId: null,
              level: null,
              pixScore: null,
              status: 'validated'
            }
          ]
        }),
        Assessment.fromAttributes({
          id: 4,
          userId: JOHN,
          courseId: 'courseId2',
          state: 'completed',
          createdAt: '2017-11-08 11:47:38',
          type: null,
          assessmentResults: [
            {
              assessmentId: 4,
              commentForCandidate: null,
              commentForJury: null,
              commentForOrganization: null,
              createdAt: '2018-10-27 08:44:25',
              emitter: 'PIX',
              id: 4,
              juryId: null,
              level: null,
              pixScore: null,
              status: 'validated'
            }
          ]

        }),
      ];

      // when
      const promise = assessmentRepository.findLastCompletedAssessmentsForEachCoursesByUser(JOHN, '2019-10-27 08:44:25');

      // then
      return promise.then((assessments) => {
        expect(assessments).to.have.a.lengthOf(1);

        expect(assessments[0]).to.be.an.instanceOf(Assessment);

        expect(assessments[0]).to.deep.contains(expectedAssessments[0]);
      });
    });
  });

  describe('#save', () => {

    const JOHN = 2;
    const assessmentToBeSaved = Assessment.fromAttributes({
      userId: JOHN,
      courseId: 'courseId1',
      type: Assessment.types.CERTIFICATION,
      state: 'completed',
      createdAt: '2017-11-08 11:47:38',
    });

    afterEach(() => {
      return knex('assessments').delete();
    });

    it('should save new assessment if not already existing', () => {
      // when
      const promise = assessmentRepository.save(assessmentToBeSaved);

      // then
      return promise.then((assessmentReturned) =>
        knex('assessments').where('id', assessmentReturned.id).first('id', 'userId'))
        .then((assessmentsInDb) => {
          expect(assessmentsInDb.userId).to.equal(JOHN);
        });
    });
  });

  describe('#getByCertificationCourseId', () => {

    const assessmentInDb = {
      courseId: 'course_A',
      state: 'completed',
      createdAt: '2016-10-27 08:44:25',
    };

    const competenceMark = {
      level: 4,
      score: 35,
      area_code: '2',
      competence_code: '2.1',
    };

    const expectedAssessmentResult = {
      id: 12,
      level: 0,
      pixScore: 0,
      status: 'validated',
      emitter: 'PIX-ALGO',
      juryId: 1,
      commentForJury: 'Computed',
      commentForCandidate: 'Votre certification a été validé par Pix',
      commentForOrganization: 'Sa certification a été validé par Pix',
      competenceMarks: [],
      createdAt: '2016-10-27 08:44:25',
    };

    beforeEach(() => {
      return knex('assessments').insert(assessmentInDb)
        .then(assessmentIds => {
          const assessmentId = _.first(assessmentIds);
          const result = {
            id: 12,
            level: 0,
            pixScore: 0,
            status: 'validated',
            emitter: 'PIX-ALGO',
            juryId: 1,
            commentForJury: 'Computed',
            commentForCandidate: 'Votre certification a été validé par Pix',
            commentForOrganization: 'Sa certification a été validé par Pix',
            createdAt: '2016-10-27 08:44:25',
          };
          result.assessmentId = assessmentId;
          expectedAssessmentResult.assessmentId = assessmentId;

          return knex('assessment-results').insert(result);
        })
        .then((resultIds) => {
          const resultId = _.first(resultIds);

          competenceMark.assessmentResultId = resultId;
          return knex('competence-marks').insert(competenceMark);
        });
    });

    afterEach(() => {
      return Promise.all([
        knex('assessments').delete(),
        knex('assessment-results').delete(),
        knex('competence-marks').delete(),
      ]);
    });

    it('should returns assessment results for the given certificationId', () => {
      // when

      const promise = assessmentRepository.getByCertificationCourseId('course_A');

      // then
      return promise.then((assessmentReturned) => {
        expect(assessmentReturned).to.be.an.instanceOf(Assessment);
        expect(assessmentReturned.courseId).to.equal('course_A');
        expect(assessmentReturned.pixScore).to.equal(assessmentInDb.pixScore);
        expect(assessmentReturned.assessmentResults).to.have.lengthOf(1);
        expect(assessmentReturned.assessmentResults[0]).to.deep.equal(expectedAssessmentResult);
      });
    });
  });
});
