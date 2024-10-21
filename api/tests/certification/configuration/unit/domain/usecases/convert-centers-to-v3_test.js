import { convertCentersToV3 } from '../../../../../../src/certification/configuration/domain/usecases/convert-centers-to-v3.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | convert-centers-to-v3', function () {
  it('should update v2 certification courses to v3', async function () {
    const centerRepository = {
      updateCentersToV3: sinon.stub().resolves(),
    };
    const preservedCenterIds = ['123'];
    await convertCentersToV3({
      isDryRun: false,
      preservedCenterIds,
      centerRepository,
    });

    expect(centerRepository.updateCentersToV3).to.have.been.calledWithExactly({ preservedCenterIds });
  });

  context('when isDryRun is true', function () {
    it('should skip update', async function () {
      const centerRepository = {
        updateCentersToV3: sinon.stub().resolves(),
        findV2CenterIds: sinon.stub().resolves(['v2CenterId']),
      };
      const preservedCenterIds = ['123'];
      await convertCentersToV3({
        isDryRun: true,
        preservedCenterIds,
        centerRepository,
      });

      expect(centerRepository.updateCentersToV3).not.to.have.been.called;
      expect(centerRepository.findV2CenterIds).to.have.been.calledWithExactly({ preservedCenterIds });
    });
  });
});
