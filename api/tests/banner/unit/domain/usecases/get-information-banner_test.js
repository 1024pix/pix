import sinon from 'sinon';

import { getInformationBanner } from '../../../../../src/communication/banner/domain/usecases/get-information-banner.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | UseCase | Get Information Banner', function () {
  it('should use information banner repository to get information banner', async function () {
    const id = 'pix-target';
    const informationBannerRepository = {
      get: sinon.stub().rejects(new Error('get function called with wrong arguments')),
    };
    const expectedInformationBanner = Symbol('information-banner');
    informationBannerRepository.get.withArgs({ id }).resolves(expectedInformationBanner);

    const informationBanner = await getInformationBanner({ id, informationBannerRepository });

    // then
    expect(informationBanner).to.equal(expectedInformationBanner);
  });
});
