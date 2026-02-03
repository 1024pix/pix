import { certificationReportController } from '../../../../../src/certification/session-management/application/certification-report-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/certification-report-route.js';
import { authorization } from '../../../../../src/certification/shared/application/pre-handlers/authorization.js';
import { ABORT_REASONS } from '../../../../../src/certification/shared/domain/constants/abort-reasons.js';
import { NotFoundError } from '../../../../../src/shared/application/http-errors.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Routes | Certification Report', function () {
  describe('POST /api/certification-reports/{certificationCourseId}/certification-issue-reports', function () {
    it('should return a 200', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId')
        .callsFake((request, h) => h.response(true));
      sinon.stub(certificationReportController, 'saveCertificationIssueReport').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/certification-reports/1/certification-issue-reports');

      // then
      expect(response.statusCode).to.equal(200);
    });

    context(
      'when the prehandler checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId respond a 403',
      function () {
        it('should return a 403', async function () {
          // given
          sinon
            .stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenterSessionFromCertificationCourseId')
            .callsFake((request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
            );

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/certification-reports/1/certification-issue-reports',
          );

          // then
          expect(response.statusCode).to.equal(403);
        });
      },
    );
  });

  describe('POST /api/certification-reports/{certificationCourseId}/abort', function () {
    it('Returns HTTP 200 if the logged user has access to the session', async function () {
      // given
      sinon.stub(authorization, 'verifyCertificationSessionAuthorization').returns('ok');
      sinon.stub(certificationReportController, 'abort').returns('ok');
      const payload = { data: { reason: ABORT_REASONS.TECHNICAL } };
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/certification-reports/1/abort', payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('Returns HTTP 404 if the logged user is not allowed to access the session', async function () {
      // given
      sinon.stub(authorization, 'verifyCertificationSessionAuthorization').throws(new NotFoundError('coucou'));
      const payload = { data: { reason: ABORT_REASONS.CANDIDATE } };
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/certification-reports/1/abort', payload);

      const parsedPayload = JSON.parse(response.payload);
      const errorMessage = parsedPayload.errors[0].detail;

      // then
      expect(response.statusCode).to.equal(404);
      expect(errorMessage).to.equal('coucou');
    });

    context('when abort reason is missing', function () {
      it('Returns HTTP 400', async function () {
        // given
        sinon.stub(authorization, 'verifyCertificationSessionAuthorization').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payloadWithoutAbortReason = { data: {} };

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/certification-reports/1/abort',
          payloadWithoutAbortReason,
        );

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
