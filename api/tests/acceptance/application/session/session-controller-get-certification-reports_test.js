const _ = require('lodash');

const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

const { CertificationReport } = require('../../../../lib/domain/models/CertificationReport');

describe('Acceptance | Controller | session-controller-get-certification-reports', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /sessions/{id}/certification-reports', function() {
    let sessionId;
    let userId;
    let certificationCenterId;

    beforeEach(() => {
      ({ id: sessionId, certificationCenterId } = databaseBuilder.factory.buildSession());

      return databaseBuilder.commit();
    });

    context('when user has no access to session resources', () => {

      beforeEach(() => {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      it('should return 404 HTTP status code (to keep opacity on whether forbidden or not found)', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/sessions/${sessionId}/certification-reports`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(404);
      });

    });

    context('when user has access to session resources', () => {
      let expectedCertificationReportA;
      let expectedCertificationReportB;
      let certificationCourseIdA;
      let certificationCourseIdB;

      beforeEach(() => {
        const certificationCandidateA = databaseBuilder.factory.buildCertificationCandidate({ lastName: 'Aa', sessionId });
        const certificationCandidateB = databaseBuilder.factory.buildCertificationCandidate({ lastName: 'Bb', sessionId });
        _.times(5, databaseBuilder.factory.buildCertificationCandidate());
        certificationCourseIdA = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId: certificationCandidateA.userId,
          firstName: certificationCandidateA.firstName,
          lastName: certificationCandidateA.lastName,
          examinerComment: 'il a eu un soucis',
          hasSeenEndTestScreen: false,
        }).id;
        certificationCourseIdB = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId: certificationCandidateB.userId,
          firstName: certificationCandidateB.firstName,
          lastName: certificationCandidateB.lastName,
          examinerComment: 'ok',
          hasSeenEndTestScreen: true,
        }).id;

        expectedCertificationReportA = {
          'certification-course-id': certificationCourseIdA,
          'first-name': certificationCandidateA.firstName,
          'last-name': certificationCandidateA.lastName,
          'examiner-comment': 'il a eu un soucis',
          'has-seen-end-test-screen': false,
        };
        expectedCertificationReportB = {
          'certification-course-id': certificationCourseIdB,
          'first-name': certificationCandidateB.firstName,
          'last-name': certificationCandidateB.lastName,
          'examiner-comment': 'ok',
          'has-seen-end-test-screen': true,
        };

        userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });

        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/sessions/${sessionId}/certification-reports`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return the expected data', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/sessions/${sessionId}/certification-reports`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(_.map(response.result.data, (it) => it.id)).to.deep.equal([
          CertificationReport.idFromCertificationCourseId(certificationCourseIdA),
          CertificationReport.idFromCertificationCourseId(certificationCourseIdB),
        ]);
        expect(_.map(response.result.data, (it) => it.attributes)).to.deep.equal([
          expectedCertificationReportA,
          expectedCertificationReportB,
        ]);
      });

    });

  });

});
