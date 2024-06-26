import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
} from '../../../../test-helper.js';
import { createSuccessfulCertificationCourse } from '../../../shared/fixtures/certification-course.js';

describe('Acceptance | Route | certification-course', function () {
  describe('POST /api/admin/certification-courses/{id}/reject', function () {
    describe('when certification is V2', function () {
      it('should create a new rejected AssessmentResult', async function () {
        // given
        const userId = (await insertUserWithRoleSuperAdmin()).id;

        const session = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2018-12-01T01:02:03Z'),
        });

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId,
        });

        const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
          userId,
          certificationCourse,
        });

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/admin/certification-courses/${certificationCourse.id}/reject`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
        const rejectedCertificationCourse = await knex('certification-courses').first();
        const assessmentResults = await knex('assessment-results')
          .where({
            assessmentId: assessment.id,
          })
          .orderBy('createdAt');

        expect(rejectedCertificationCourse.isRejectedForFraud).to.equal(true);
        expect(assessmentResults).to.have.length(2);
        expect(assessmentResults[0].id).to.deep.equal(assessmentResult.id);
        expect(assessmentResults[1].status).to.equal('rejected');

        const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

        expect(lastAssessmentResult).to.deep.equal({
          certificationCourseId: certificationCourse.id,
          lastAssessmentResultId: assessmentResults[1].id,
        });
      });
    });

    describe('when certification is V3', function () {
      it('should create a new rejected AssessmentResult', async function () {
        // given
        const userId = (await insertUserWithRoleSuperAdmin()).id;

        databaseBuilder.factory.buildFlashAlgorithmConfiguration();

        databaseBuilder.factory.buildScoringConfiguration({
          createdByUserId: userId,
        });

        const session = databaseBuilder.factory.buildSession({
          publishedAt: new Date('2018-12-01T01:02:03Z'),
          version: 3,
        });

        const configuration = [
          {
            competence: '1.1',
            values: [
              {
                bounds: {
                  max: -2.2,
                  min: -9.8,
                },
                competenceLevel: 0,
              },
            ],
          },
        ];

        databaseBuilder.factory.buildCompetenceScoringConfiguration({
          configuration,
          createdAt: new Date('2018-01-01T08:00:00Z'),
          createdByUserId: userId,
        });

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          userId,
          version: 3,
        });

        const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
          userId,
          certificationCourse,
        });

        const server = await createServer();

        // when
        const response = await server.inject({
          method: 'POST',
          url: `/api/admin/certification-courses/${certificationCourse.id}/reject`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
        const rejectedCertificationCourse = await knex('certification-courses').first();
        const assessmentResults = await knex('assessment-results')
          .where({
            assessmentId: assessment.id,
          })
          .orderBy('createdAt');

        expect(rejectedCertificationCourse.isRejectedForFraud).to.equal(true);
        expect(assessmentResults).to.have.length(2);
        expect(assessmentResults[0].id).to.equal(assessmentResult.id);
        expect(assessmentResults[1].status).to.equal('rejected');

        const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

        expect(lastAssessmentResult).to.deep.equal({
          certificationCourseId: certificationCourse.id,
          lastAssessmentResultId: assessmentResults[1].id,
        });
      });
    });
  });

  describe('POST /api/admin/certification-courses/{id}/unreject', function () {
    it('should create a new unrejected AssessmentResult', async function () {
      // given
      const userId = (await insertUserWithRoleSuperAdmin()).id;

      const session = databaseBuilder.factory.buildSession({
        publishedAt: new Date('2018-12-01T01:02:03Z'),
      });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId,
        isRejectedForFraud: true,
      });

      const { assessment, assessmentResult } = await createSuccessfulCertificationCourse({
        userId,
        certificationCourse,
      });

      const server = await createServer();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/certification-courses/${certificationCourse.id}/unreject`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      const unrejectedCertificationCourse = await knex('certification-courses').first();
      const assessmentResults = await knex('assessment-results')
        .where({
          assessmentId: assessment.id,
        })
        .orderBy('createdAt');

      expect(unrejectedCertificationCourse.isRejectedForFraud).to.equal(false);
      expect(assessmentResults).to.have.length(2);
      expect(assessmentResults[0].id).to.equal(assessmentResult.id);
      expect(assessmentResults[1].status).to.equal('validated');

      const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

      expect(lastAssessmentResult).to.deep.equal({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResults[1].id,
      });
    });
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/assessment-results', function () {
    let certificationCourseId;
    let options;
    let server;

    beforeEach(async function () {
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentId = databaseBuilder.factory.buildAssessment({
        id: 567,
        certificationCourseId: certificationCourseId,
        type: Assessment.types.CERTIFICATION,
      }).id;
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
      }).id;
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId });
      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId,
        lastAssessmentResultId: assessmentResultId,
      });

      server = await createServer();

      options = {
        method: 'PATCH',
        url: `/api/admin/certification-courses/${certificationCourseId}/assessment-results`,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
        payload: {
          data: {
            attributes: {
              'comment-by-jury': 'Parce que voilà',
            },
          },
        },
      };
      return insertUserWithRoleSuperAdmin();
    });

    it('should respond with a 403 - forbidden access - if user has not role Super Admin', async function () {
      // given
      const nonSuperAdminUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(nonSuperAdminUserId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should update the assessment result and return a 204', async function () {
      // when
      const response = await server.inject(options);

      // then
      const assessmentResults = await knex('assessment-results');
      expect(assessmentResults).to.have.lengthOf(1);
      expect(assessmentResults.at(0).commentByJury).to.equal('Parce que voilà');
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('POST /api/admin/certification-courses-v3/{certificationCourseId}/details', function () {
    let certificationCourse;
    let certificationChallenges;
    let assessmentResult;
    let options;
    let server;

    beforeEach(async function () {
      certificationCourse = databaseBuilder.factory.buildCertificationCourse({ version: 3 });
      databaseBuilder.factory.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength: 10,
        createdAt: new Date('2020-01-01'),
      });

      const user = await insertUserWithRoleSuperAdmin();
      ({ certificationChallenges, assessmentResult } = await createSuccessfulCertificationCourse({
        userId: user.id,
        certificationCourse,
      }));
      await databaseBuilder.commit();

      server = await createServer();

      options = {
        method: 'GET',
        url: `/api/admin/certification-courses-v3/${certificationCourse.id}/details`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    it('should respond with a 403 - forbidden access - if user is not an admin member', async function () {
      // given
      const nonAdminMemberUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(nonAdminMemberUserId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return a v3 certification details for administration payload', async function () {
      // when
      const response = await server.inject(options);

      const expectedResponse = {
        type: 'v3-certification-course-details-for-administrations',
        attributes: {
          'abort-reason': null,
          'certification-course-id': certificationCourse.id,
          'completed-at': certificationCourse.completedAt,
          'created-at': certificationCourse.createdAt,
          'ended-at': null,
          'is-rejected-for-fraud': false,
          'is-cancelled': false,
          'pix-score': assessmentResult.pixScore,
          'number-of-challenges': 10,
          'assessment-state': 'completed',
          'assessment-result-status': 'validated',
        },
        id: certificationCourse.id.toString(),
        relationships: {
          'certification-challenges-for-administration': {
            data: [
              {
                id: certificationChallenges[0].challengeId,
                type: 'certification-challenges-for-administration',
              },
            ],
          },
        },
      };

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal(expectedResponse);
      expect(response.result.included).to.deep.equal([
        {
          attributes: {
            'answer-status': 'ok',
            'answered-at': new Date('2020-01-01'),
            'answer-value': '1',
            'competence-index': '1.1',
            'competence-name': 'Fabriquer un meuble',
            'skill-name': '@sau3',
            'validated-live-alert': null,
          },
          id: 'recCHAL1',
          type: 'certification-challenges-for-administration',
        },
      ]);
    });
  });
});
