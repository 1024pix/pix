import sinon from 'sinon';

import * as certificationResultAdapter from '../../../../../../src/certification/session-management/infrastructure/adapters/certification-result-adapter.js';

describe('Certification | SessionManagement | Unit | Adapter | certification result', function () {
  let certificationResultApi, dependencies;

  beforeEach(function () {
    certificationResultApi = {
      buildForSession: sinon.stub(),
    };
    certificationResultApi.buildForSession.resolves();
    dependencies = {
      certificationResultApi,
    };
  });

  context('#buildCertificationResults', function () {
    it('triggers computing certification results by passing the session id', async function () {
      await certificationResultAdapter.buildCertificationResults({
        sessionId: 123,
        dependencies,
      });

      sinon.assert.calledOnceWithExactly(certificationResultApi.buildForSession, {
        sessionId: 123,
      });
    });
  });
});
