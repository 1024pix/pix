import type { SinonStub } from 'sinon';
import sinon from 'sinon';

import * as certificationResultAdapter from '../../../../../../src/certification/session-management/infrastructure/adapters/certification-result-adapter.ts';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';

describe('Certification | SessionManagement | Unit | Adapter | certification result', function () {
  let certificationResultApi: {
    buildForSession: SinonStub<[{ sessionId: number }], Promise<void>>;
    deleteForSession: SinonStub<[{ sessionId: number }], Promise<void>>;
    updateEduV3ExternalJuryResult: SinonStub<
      [{ certificationCourseId: number; v3EduExternalJuryResult: string | null }],
      Promise<void>
    >;
    updateEduV2ExternalJuryResult: SinonStub<
      [
        {
          certificationCourseId: number;
          v2EduVoletExterneBadgeId: number | null;
          v2EduVoletExterneAcquired: boolean | null;
        },
      ],
      Promise<void>
    >;
  };
  let dependencies: { certificationResultApi: typeof certificationResultApi };

  beforeEach(function () {
    certificationResultApi = {
      buildForSession: sinon.stub(),
      deleteForSession: sinon.stub(),
      updateEduV3ExternalJuryResult: sinon.stub(),
      updateEduV2ExternalJuryResult: sinon.stub(),
    };
    certificationResultApi.buildForSession.resolves();
    certificationResultApi.deleteForSession.resolves();
    certificationResultApi.updateEduV3ExternalJuryResult.resolves();
    certificationResultApi.updateEduV2ExternalJuryResult.resolves();
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

  context('#deleteCertificationResults', function () {
    it('triggers deleting certification results by passing the session id', async function () {
      await certificationResultAdapter.deleteCertificationResults({
        sessionId: 123,
        dependencies,
      });

      sinon.assert.calledOnceWithExactly(certificationResultApi.deleteForSession, {
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

  context('#updateEduV2ExternalJuryResult', function () {
    it('updates the external jury result by passing the certification course id, the badge and the acquisition', async function () {
      await certificationResultAdapter.updateEduV2ExternalJuryResult({
        certificationCourseId: 123,
        v2EduVoletExterneBadgeId: 456,
        v2EduVoletExterneAcquired: true,
        dependencies,
      });

      sinon.assert.calledOnceWithExactly(certificationResultApi.updateEduV2ExternalJuryResult, {
        certificationCourseId: 123,
        v2EduVoletExterneBadgeId: 456,
        v2EduVoletExterneAcquired: true,
      });
    });
  });
});
