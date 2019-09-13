const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const { InternalError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | add-organization-logo-to-campaign', () => {

  const organizationId = 'organizationId';
  const campaign = { id: 'campaignId', organizationId };
  const organization = { id: organizationId, logoUrl: 'a logo url' };
  const augmentedCampaign = Object.assign({}, campaign, { organizationLogoUrl: organization.logoUrl });
  const testError = 'some error';

  context('The related organization exist', () => {

    beforeEach(() => {
      sinon.stub(organizationRepository, 'get').resolves(organization);
    });

    it('should return the same campaign with adding the organization logo url', async () => {
      // when
      const campaignRes = await usecases.addOrganizationLogoToCampaign({ campaign });

      // then
      expect(campaignRes).to.be.deep.equal(augmentedCampaign);
    });
  });

  context('The related organization does not exist', () => {

    beforeEach(() => {
      sinon.stub(organizationRepository, 'get').resolves(null);
    });

    it('should throw an Internal Error', async () => {
      // when
      try {
        await usecases.addOrganizationLogoToCampaign({ campaign });
      }

        // then
      catch (error) {
        return expect(error).to.be.an instanceof (InternalError);
      }
    });
  });

  context('The related organization could not be retrieved', () => {
    beforeEach(() => {
      sinon.stub(organizationRepository, 'get').rejects(testError);
    });

    it('should forward the error', async () => {
      // when
      try {
        await usecases.addOrganizationLogoToCampaign({ campaign });
      }
      // then
      catch (error) {
        return expect(error.name).to.equal(testError);
      }
    });
  });
});
