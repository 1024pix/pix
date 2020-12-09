const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Acceptance | Controller | session-controller-get-jury-certification-summaries', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/admin/sessions/{id}/jury-certification-summaries', function() {
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
          url: `/api/admin/sessions/${sessionId}/jury-certification-summaries`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });

    });

    context('when user has role PixMaster', () => {
      let pixMasterId;
      let certif1;
      let certif2;
      let asr1;
      let expectedJuryCertifSumm1;
      let expectedJuryCertifSumm2;
      let request;

      beforeEach(() => {
        const dbf = databaseBuilder.factory;
        pixMasterId = dbf.buildUser.withPixRolePixMaster().id;
        sessionId = dbf.buildSession().id;
        const badge = dbf.buildBadge({ key: Badge.keys.PIX_EMPLOI_CLEA });

        certif1 = dbf.buildCertificationCourse({ sessionId, lastName: 'AAA' });
        dbf.buildPartnerCertification({ certificationCourseId: certif1.id, partnerKey: badge.key, acquired: true });
        const assessmentId1 = dbf.buildAssessment({ certificationCourseId: certif1.id }).id;
        asr1 = dbf.buildAssessmentResult({ assessmentId: assessmentId1, createdAt: new Date('2018-04-15T00:00:00Z') });

        certif2 = dbf.buildCertificationCourse({ sessionId, lastName: 'CCC' });
        dbf.buildAssessment({ certificationCourseId: certif2.id });

        expectedJuryCertifSumm1 = {
          'first-name': certif1.firstName,
          'last-name': certif1.lastName,
          'status': asr1.status,
          'pix-score': asr1.pixScore,
          'is-published': certif1.isPublished,
          'created-at': certif1.createdAt,
          'completed-at': certif1.completedAt,
          'clea-certification-status': 'acquired',
          'examiner-comment': undefined,
          'has-seen-end-test-screen': certif1.hasSeenEndTestScreen,
        };
        expectedJuryCertifSumm2 = {
          'first-name': certif2.firstName,
          'last-name': certif2.lastName,
          'status': 'started',
          'pix-score': null,
          'is-published': certif2.isPublished,
          'created-at': certif2.createdAt,
          'clea-certification-status': 'not_passed',
          'completed-at': certif2.completedAt,
          'examiner-comment': undefined,
          'has-seen-end-test-screen': certif2.hasSeenEndTestScreen,
        };

        request = {
          method: 'GET',
          url: `/api/admin/sessions/${sessionId}/jury-certification-summaries`,
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
        expect(response.result.data[0].attributes).to.deep.equal(expectedJuryCertifSumm1);
        expect(response.result.data[0].id).to.deep.equal(certif1.id.toString());
        expect(response.result.data[1].attributes).to.deep.equal(expectedJuryCertifSumm2);
        expect(response.result.data[1].id).to.deep.equal(certif2.id.toString());
      });

    });

  });

});
