import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { CLEA } from '../../../../lib/domain/models/ComplementaryCertification.js';

describe('Acceptance | Controller | session-controller-get-jury-certification-summaries', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/sessions/{id}/jury-certification-summaries', function () {
    let sessionId;

    beforeEach(function () {
      sessionId = databaseBuilder.factory.buildSession().id;

      return databaseBuilder.commit();
    });

    context('when user has not the role Super Admin', function () {
      let userId;

      beforeEach(function () {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      it('should return 403 HTTP status code', async function () {
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

    context('when user has role Super Admin', function () {
      let superAdminId;
      let certif1;
      let certif2;
      let asr1;
      let expectedJuryCertifSumm1;
      let expectedJuryCertifSumm2;
      let request;

      beforeEach(function () {
        const dbf = databaseBuilder.factory;
        superAdminId = dbf.buildUser.withRole().id;
        sessionId = dbf.buildSession().id;
        const badge = dbf.buildBadge();

        const complementaryCertificationId = dbf.buildComplementaryCertification({
          name: 'CléA Numérique',
          badge: badge,
        }).id;
        const complementaryCertificationBadgeId = dbf.buildComplementaryCertificationBadge({
          badgeId: badge.id,
          complementaryCertificationId,
          label: 'CléA Numérique',
        }).id;

        certif1 = dbf.buildCertificationCourse({ sessionId, lastName: 'AAA' });
        const { id } = dbf.buildComplementaryCertificationCourse({
          certificationCourseId: certif1.id,
          name: CLEA,
          complementaryCertificationId,
          complementaryCertificationBadgeId,
        });
        dbf.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: id,
          complementaryCertificationBadgeId,
          partnerKey: badge.key,
          acquired: true,
        });
        asr1 = dbf.buildAssessmentResult.last({
          certificationCourseId: certif1.id,
          createdAt: new Date('2018-04-15T00:00:00Z'),
        });

        certif2 = dbf.buildCertificationCourse({ sessionId, lastName: 'CCC' });
        dbf.buildAssessment({ certificationCourseId: certif2.id });

        expectedJuryCertifSumm1 = {
          'first-name': certif1.firstName,
          'last-name': certif1.lastName,
          status: asr1.status,
          'pix-score': asr1.pixScore,
          'is-published': certif1.isPublished,
          'is-cancelled': certif1.isCancelled,
          'created-at': certif1.createdAt,
          'completed-at': certif1.completedAt,
          'number-of-certification-issue-reports': 0,
          'number-of-certification-issue-reports-with-required-action': 0,
          'complementary-certification-taken-label': 'CléA Numérique',
          'examiner-comment': undefined,
          'has-seen-end-test-screen': certif1.hasSeenEndTestScreen,
          'is-flagged-aborted': false,
        };
        expectedJuryCertifSumm2 = {
          'first-name': certif2.firstName,
          'last-name': certif2.lastName,
          status: 'started',
          'pix-score': null,
          'is-cancelled': certif2.isCancelled,
          'is-published': certif2.isPublished,
          'created-at': certif2.createdAt,
          'number-of-certification-issue-reports': 0,
          'number-of-certification-issue-reports-with-required-action': 0,
          'complementary-certification-taken-label': null,
          'completed-at': certif2.completedAt,
          'examiner-comment': undefined,
          'has-seen-end-test-screen': certif2.hasSeenEndTestScreen,
          'is-flagged-aborted': false,
        };

        request = {
          method: 'GET',
          url: `/api/admin/sessions/${sessionId}/jury-certification-summaries`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(superAdminId) },
        };

        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the expected data', async function () {
        // when
        const response = await server.inject(request);

        // then
        expect(response.result.data).to.deep.equal([
          { type: 'jury-certification-summaries', id: certif1.id.toString(), attributes: expectedJuryCertifSumm1 },
          { type: 'jury-certification-summaries', id: certif2.id.toString(), attributes: expectedJuryCertifSumm2 },
        ]);
      });
    });
  });
});
