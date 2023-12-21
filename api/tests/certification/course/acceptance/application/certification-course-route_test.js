import {
  generateValidRequestAuthorizationHeader,
  expect,
  knex,
  insertUserWithRoleSuperAdmin,
  databaseBuilder,
} from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';
import { createSuccessfulCertificationCourse } from '../../../shared/fixtures/certification-course.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

describe('Acceptance | Route | certification-course', function () {
  describe('POST /api/admin/certification-courses/{id}/reject', function () {
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
      expect(assessmentResults[0]).to.deep.equal(assessmentResult);
      expect(assessmentResults[1].status).to.equal('rejected');

      const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

      expect(lastAssessmentResult).to.deep.equal({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResults[1].id,
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
      expect(assessmentResults[0]).to.deep.equal(assessmentResult);
      expect(assessmentResults[1].status).to.equal('validated');

      const lastAssessmentResult = await knex('certification-courses-last-assessment-results').first();

      expect(lastAssessmentResult).to.deep.equal({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResults[1].id,
      });
    });
  });

  describe('POST /api/admin/certification-courses/{certificationCourseId}/assessment-results', function () {
    let certificationCourseId;
    let options;
    let server;

    beforeEach(async function () {
      certificationCourseId = databaseBuilder.factory.buildCertificationCourse().id;
      const assessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourseId,
        type: Assessment.types.CERTIFICATION,
      }).id;
      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
      }).id;
      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId });

      server = await createServer();

      options = {
        method: 'POST',
        url: `/api/admin/certification-courses/${certificationCourseId}/assessment-results`,
        headers: { authorization: generateValidRequestAuthorizationHeader() },
        payload: {
          data: {
            type: 'assessment-results',
            attributes: {
              'assessment-id': assessmentId,
              'pix-score': 27,
              status: 'validated',
              emitter: 'Jury',
              'comment-for-jury': 'Parce que',
              'comment-for-candidate': 'Voilà',
              'comment-for-organization': 'Je suis sûr que vous etes ok avec nous',
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

    it('should return a 204 after saving in database', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should save an assessment-results and 1 mark', async function () {
      // when
      await server.inject(options);

      // then
      const assessmentResults = await knex('assessment-results').orderBy('createdAt', 'desc');
      expect(assessmentResults).to.have.lengthOf(2);
      const competenceMarks = await knex('competence-marks').where({ assessmentResultId: assessmentResults[0].id });
      expect(competenceMarks).to.have.lengthOf(1);
    });
  });

  describe('POST /api/admin/certification-courses-v3/{id}/details', function () {
    let certificationCourseId;
    let options;
    let server;
    let certificationChallenge1;
    let certificationChallenge2;

    beforeEach(async function () {
      const userId = databaseBuilder.factory.buildUser.withRole().id;

      certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        userId,
      }).id;

      const assessmentId = databaseBuilder.factory.buildAssessment({
        certificationCourseId,
        userId,
        type: Assessment.types.CERTIFICATION,
      }).id;

      certificationChallenge1 = databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        challengeId: 'recCHAL456',
      });

      certificationChallenge2 = databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        challengeId: 'recCHAL789',
      });

      const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        certificationCourseId,
      }).id;

      databaseBuilder.factory.buildCompetenceMark({ assessmentResultId });

      server = await createServer();

      options = {
        method: 'GET',
        url: `/api/admin/certification-courses-v3/${certificationCourseId}/details`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };

      await databaseBuilder.commit();
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
          'certification-course-id': certificationCourseId,
        },
        id: certificationCourseId.toString(),
        relationships: {
          'certification-challenges-for-administration': {
            data: [
              {
                id: certificationChallenge1.challengeId,
                type: 'certification-challenges-for-administration',
              },
              {
                id: certificationChallenge2.challengeId,
                type: 'certification-challenges-for-administration',
              },
            ],
          },
        },
      };

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal(expectedResponse);
    });
  });
});
