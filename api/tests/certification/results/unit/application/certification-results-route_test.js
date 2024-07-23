import { certificationResultsController } from '../../../../../src/certification/results/application/certification-results-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/results/application/certification-results-route.js';
import { authorization } from '../../../../../src/certification/shared/application/pre-handlers/authorization.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Results | Unit | Application | Certification Results Route', function () {
  describe('GET /api/sessions/{id}/certified-clea-candidate-data', function () {
    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').returns(null);
      sinon.stub(certificationResultsController, 'getCleaCertifiedCandidateDataCsv').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/3/certified-clea-candidate-data');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
