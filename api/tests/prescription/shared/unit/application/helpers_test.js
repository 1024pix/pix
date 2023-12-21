import { expect } from '../../../../test-helper.js';
import { mapCertificabilityByLabel } from '../../../../../src/prescription/shared/application/helpers.js';

describe('Unit | Application | helpers', function () {
  it('map the certificability eligible value', async function () {
    // given
    const certificabilityFilter = 'eligible';

    // when
    const result = mapCertificabilityByLabel(certificabilityFilter);

    // then
    expect(result).to.deep.equal([true]);
  });

  it('map the certificability non-eligible value', async function () {
    // given
    const certificabilityFilter = 'non-eligible';

    // when
    const result = mapCertificabilityByLabel(certificabilityFilter);

    // then
    expect(result).to.deep.equal([false]);
  });

  it('map the certificability not-available value', async function () {
    // given
    const certificabilityFilter = 'not-available';

    // when
    const result = mapCertificabilityByLabel(certificabilityFilter);

    // then
    expect(result).to.deep.equal([null]);
  });

  it('map multiple certificability values', async function () {
    // given
    const certificabilityFilter = ['not-available', 'eligible'];

    // when
    const result = mapCertificabilityByLabel(certificabilityFilter);

    // then
    expect(result).to.deep.equal([null, true]);
  });
});
