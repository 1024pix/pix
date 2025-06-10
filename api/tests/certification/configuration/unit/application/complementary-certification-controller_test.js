import { complementaryCertificationController } from '../../../../../src/certification/configuration/application/complementary-certification-controller.js';
import { usecases } from '../../../../../src/certification/configuration/domain/usecases/index.js';
import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Configuration | Unit | Application | Controller | complementary-certifications-controller', function () {
  it('should call updateConsolidatedFrameworkCalibration usecase', async function () {
    // given
    const request = {
      headers: {
        authorization: 'Bearer my-token',
      },
      params: {
        complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
      },
    };

    sinon.stub(usecases, 'updateConsolidatedFrameworkCalibration');

    // when
    await complementaryCertificationController.updateConsolidatedFrameworkCalibration(request, hFake, {
      complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
    });

    // then
    sinon.assert.calledOnce(usecases.updateConsolidatedFrameworkCalibration);
  });
});
