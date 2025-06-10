import { updateConsolidatedFrameworkCalibration } from '../../../../../../src/certification/configuration/domain/usecases/update-consolidated-framework-calibration.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { expect } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | update-consolidated-framework-calibration', function () {
  it('should work', async function () {
    // given

    // when
    const result = await updateConsolidatedFrameworkCalibration({
      complementaryCertificationKey: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
    });

    // then
    expect(result).to.deep.equal({});
  });
});
