import { expect, sinon } from '../../../../test-helper.js';
import { createCampaigns } from '../../../../../lib/domain/usecases/campaigns-administration/create-campaigns.js';

describe('Unit | UseCase | create-campaign', function () {
  it('Should save these informations', async function () {
    const campaignAdministrationRepository = {
      createCampaigns: sinon.stub(),
    };
    const userId = Symbol('userId');

    await createCampaigns({
      userId,
      campaignAdministrationRepository,
    });

    expect(campaignAdministrationRepository.createCampaigns).to.have.been.calledWith(userId);
  });
});
