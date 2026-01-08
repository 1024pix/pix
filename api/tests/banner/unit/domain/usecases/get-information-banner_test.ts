import { makeUsecase } from '../../../../../src/banner/domain/usecases/get-information-banner.ts';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | UseCase | Get Information Banner', function () {
  it('should use information banner repository to get information banner', async function () {
    const id = 'pix-target';
    const expectedInformationBanner = Symbol('information-banner');
    const InformationBannerRepository = {
      get: sinon.stub().rejects(new Error('get function called with wrong arguments')),
    };
    InformationBannerRepository.get.withArgs(id).resolves(expectedInformationBanner);

    const getInformationBanner = makeUsecase({ InformationBannerRepository });
    const informationBanner = await getInformationBanner({ id });

    // then
    expect(informationBanner).to.equal(expectedInformationBanner);
  });
});
