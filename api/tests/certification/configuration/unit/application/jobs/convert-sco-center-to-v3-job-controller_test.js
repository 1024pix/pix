import { ConvertScoCenterToV3JobController } from '../../../../../../src/certification/configuration/application/jobs/convert-sco-center-to-v3-job-controller.js';
import { ConvertScoCenterToV3Job } from '../../../../../../src/certification/configuration/domain/models/ConvertScoCenterToV3Job.js';
import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Certification | Configuration | Application | Jobs | ConvertScoCenterToV3JobController', function () {
  describe('handle', function () {
    it('should call usecase', async function () {
      // given
      sinon.stub(usecases, 'deleteUnstartedSessions').resolves();
      sinon.stub(usecases, 'registerCenterPilotFeatures').resolves();
      const handler = new ConvertScoCenterToV3JobController();
      const data = new ConvertScoCenterToV3Job({ centerId: 12 });

      // when
      await handler.handle({ data });

      // then
      expect(usecases.deleteUnstartedSessions).to.have.been.calledWithExactly({ centerId: 12 });
      expect(usecases.registerCenterPilotFeatures).to.have.been.calledWithExactly({ centerId: 12, isV3Pilot: true });
    });
  });
});
