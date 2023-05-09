import { expect, sinon } from '../../../test-helper.js';
import { useCase } from '../../../../lib/application/usecases/checkPix1dEnabled.js';
import { settings } from '../../../../lib/config.js';

describe('Unit | Application | Use Case | checkPix1dEnabled', function () {
  it('should resolve true when the admin member has role super admin', async function () {
    // given
    sinon.stub(settings.featureToggles, 'isPix1dEnabled').value(true);

    // when
    const result = await useCase.execute();
    // then
    expect(result).to.be.true;
  });

  it('should resolve false when the admin member does not have role admin', async function () {
    // given
    sinon.stub(settings.featureToggles, 'isPix1dEnabled').value(false);

    // when
    const result = await useCase.execute();

    // then
    expect(result).to.be.false;
  });
});
