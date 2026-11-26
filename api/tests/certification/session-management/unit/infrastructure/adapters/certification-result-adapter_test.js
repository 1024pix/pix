import sinon from 'sinon';

import * as certificationResultAdapter from '../../../../../../src/certification/session-management/infrastructure/adapters/certification-result-adapter.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';

describe('Certification | SessionManagement | Unit | Adapter | certification result', function () {
  let certificationResultApi, dependencies;

  beforeEach(function () {
    certificationResultApi = {
      buildForSession: sinon.stub(),
      updateEduV3ExternalJuryResult: sinon.stub(),
    };
    certificationResultApi.buildForSession.resolves();
    certificationResultApi.updateEduV3ExternalJuryResult.resolves();
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

  context('#updateEduV3ExternalJuryResult', function () {
    it('updates the external jury result by passing the certification course id and the result', async function () {
      await certificationResultAdapter.updateEduV3ExternalJuryResult({
        certificationCourseId: 123,
        eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
        dependencies,
      });

      sinon.assert.calledOnceWithExactly(certificationResultApi.updateEduV3ExternalJuryResult, {
        certificationCourseId: 123,
        v3EduExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.EXPERT,
      });
    });
  });
});
