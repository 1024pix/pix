const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const { types } = require('../../../../lib/domain/models/Assessment');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-get-certifications', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /jury/sessions/{id}/certifications', function() {
    let sessionId;

    beforeEach(() => {
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    context('when user has not the role PixMaster', () => {
      let userId;

      beforeEach(() => {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      it('should return 403 HTTP status code', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/jury/sessions/${sessionId}/certifications`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });

    });

    context('when user has role PixMaster', () => {
      let expectedCertificationAttributes;
      let certificationCourse;
      let assessment;
      let assessmentResult;
      let competenceMark1;
      let competenceMark2;
      let request;
      let pixMasterId;

      beforeEach(() => {
        pixMasterId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
        certificationCourse = databaseBuilder.factory.buildCertificationCourse({ sessionId });
        assessment = databaseBuilder.factory.buildAssessment({ type: types.CERTIFICATION, certificationCourseId: certificationCourse.id });
        assessmentResult = databaseBuilder.factory.buildAssessmentResult({ assessmentId: assessment.id });
        competenceMark1 = databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: assessmentResult.id });
        competenceMark2 = databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: assessmentResult.id });

        expectedCertificationAttributes = {
          'first-name': certificationCourse.firstName,
          'last-name': certificationCourse.lastName,
          'birthdate': certificationCourse.birthdate,
          'birthplace': certificationCourse.birthplace,
          'external-id': certificationCourse.externalId,
          'is-published': certificationCourse.isPublished,
          'session-id': certificationCourse.sessionId,
          'is-v2-certification': certificationCourse.isV2Certification,
          'created-at': certificationCourse.createdAt,
          'completed-at': certificationCourse.completedAt,
          'assessment-id': assessment.id,
          'comment-for-candidate': assessmentResult.commentForCandidate,
          'comment-for-jury': assessmentResult.commentForJury,
          'comment-for-organization': assessmentResult.commentForOrganization,
          'examiner-comment': certificationCourse.examinerComment,
          'has-seen-end-test-screen': certificationCourse.hasSeenEndTestScreen,
          'emitter': assessmentResult.emitter,
          'jury-id': assessmentResult.juryId,
          'level': assessmentResult.level,
          'pix-score': assessmentResult.pixScore,
          'status': assessmentResult.status,
          'result-created-at': assessmentResult.createdAt,
          'competences-with-mark': [
            {
              'id': competenceMark1.id,
              'area-code': competenceMark1.area_code,
              'assessment-result-id': competenceMark1.assessmentResultId,
              'competence-code': competenceMark1.competence_code,
              'created-at': competenceMark1.createdAt,
              'level': competenceMark1.level,
              'score': competenceMark1.score,
            },
            {
              'id': competenceMark2.id,
              'area-code': competenceMark2.area_code,
              'assessment-result-id': competenceMark2.assessmentResultId,
              'competence-code': competenceMark2.competence_code,
              'created-at': competenceMark2.createdAt,
              'level': competenceMark2.level,
              'score': competenceMark2.score,
            },
          ],
        };

        request = {
          method: 'GET',
          url: `/api/jury/sessions/${sessionId}/certifications`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(pixMasterId) },
        };

        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the expected data', async () => {
        // when
        const response = await server.inject(request);

        // then
        expect(response.result.data[0].attributes).to.deep.equal(expectedCertificationAttributes);
        expect(response.result.data[0].id).to.deep.equal(certificationCourse.id.toString());
      });

    });

  });

});
