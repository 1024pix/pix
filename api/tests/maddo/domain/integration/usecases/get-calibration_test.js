import { getCalibration } from '../../../../../src/maddo/domain/usecases/get-calibration.js';
import { expect } from '../../../../test-helper.js';

describe('Maddo | Domain | Usecases | Integration | get-calibration', function () {
  it('should run calibration for given scope', async function () {
    // when
    const result = await getCalibration({ scope: 'droit' });

    // then
    expect(result).to.deep.equal([]);
  });
});
