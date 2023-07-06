import { expect, sinon } from '../../../../test-helper.js';
import { createCampaigns } from '../../../../../lib/domain/usecases/campaigns-administration/create-campaigns.js';

describe.only('Unit | UseCase | create-campaign', function () {
  it('Should save these informations', async function () {
    const campaignAdministrationRepository = {
      createCampaigns: sinon.stub(async () => {
        return;
      }),
    };
    const userId = Symbol('userId');
    const campaignsToCreate = [];

    await createCampaigns({
      userId,
      campaignAdministrationRepository,
    });

    expect(campaignAdministrationRepository.createCampaigns).to.have.been.calledWith(campaignsToCreate, userId);
  });

  it.skip('should retrieve organization informations', async function () {
    const campaignAdministrationRepository = {
      createCampaigns: sinon.stub(),
    };
    const userId = Symbol('userId');
    const organization = databaseBuilder.factory.buildOrganization({ id: 3, externalId: '1237457A' });

    await createCampaigns({
      userId,
      campaignAdministrationRepository,
    });

    expect().to.be.equal(organization.id);
  });
});
