import { certificationCandidatesController } from '../../../../lib/application/certification-candidates/certification-candidates-controller.js';
import * as moduleUnderTest from '../../../../lib/application/certification-candidates/index.js';
import { assessmentSupervisorAuthorization as sessionSupervisorAuthorization } from '../../../../src/certification/shared/application/pre-handlers/session-supervisor-authorization.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | CertificationCandidates | Routes', function () {
  describe('PATCH certification-candidates/{id}/end-assessment-by-supervisor', function () {
    it('should return 200 if the user is a supervisor of the session linked to the candidate', async function () {
      // given
      sinon
        .stub(sessionSupervisorAuthorization, 'verifyByCertificationCandidateId')
        .callsFake((request, h) => h.response(true));
      sinon.stub(certificationCandidatesController, 'endAssessmentBySupervisor').returns(null);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(
        'PATCH',
        '/api/certification-candidates/1/end-assessment-by-supervisor',
      );

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return 401 if the user is not a supervisor of the session linked to the candidate', async function () {
      // given
      sinon
        .stub(sessionSupervisorAuthorization, 'verifyByCertificationCandidateId')
        .callsFake((request, h) => h.response().code(401).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(
        'PATCH',
        '/api/certification-candidates/1/end-assessment-by-supervisor',
      );

      // then
      expect(response.statusCode).to.equal(401);
    });
  });
});
