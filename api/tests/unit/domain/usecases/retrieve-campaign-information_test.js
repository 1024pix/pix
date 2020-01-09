const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Campaign = require('../../../../lib/domain/models/Campaign');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | retrieve-campaign-information', () => {

  let campaign;
  let campaignRepoStub;
  let orgaRepoStub;
  const organizationId = 'organizationId';
  const organization = { id: organizationId, logoUrl: 'a logo url', type: 'SCO', name: 'College Victor Hugo' };
  const campaignCode = 'QWERTY123';
  const user = { id: 1, firstName: 'John', lastName: 'Snow' };

  beforeEach(() => {
    campaign = domainBuilder.buildCampaign({ id: 'campaignId', organizationId });
    campaignRepoStub = sinon.stub(campaignRepository, 'getByCode');
    orgaRepoStub = sinon.stub(organizationRepository, 'get').resolves(organization);
  });

  context('the campaign does not exist', async () => {

    it('should throw a NotFound error', async () => {
      // given
      campaignRepoStub.resolves(null);

      // when
      const error = await catchErr(usecases.retrieveCampaignInformation)({ code: campaignCode, userId: user.id });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('the campaign exists', () => {

    beforeEach(() => {
      campaignRepoStub.resolves(campaign);
    });

    it('should return the campaign ', async () => {
      // when
      const result = await usecases.retrieveCampaignInformation({ code: campaignCode });

      // then
      expect(campaignRepository.getByCode).to.have.been.calledWithExactly(campaignCode);
      expect(result).to.deep.equal(campaign);
    });

    context('The related organization exist', () => {

      it('should return the same campaign with adding the organization logo url and name', async () => {
        // given
        const { logoUrl: organizationLogoUrl, name: organizationName } = organization;
        const augmentedCampaign = { ...campaign, organizationLogoUrl, organizationName };

        // when
        const foundCampaign = await usecases.retrieveCampaignInformation({ code: campaignCode });

        // then
        expect(foundCampaign).to.deep.equal(augmentedCampaign);
      });

      context('Organization of the campaign is managing student', () => {

        beforeEach(() => {
          orgaRepoStub.resolves(Object.assign(organization, { isManagingStudents: true }));
        });

        it('return a campaign with isRestricted equal true', async () => {
          // when
          const result = await usecases.retrieveCampaignInformation({ code: campaignCode });

          // then
          expect(result).to.be.instanceof(Campaign);
          expect(result.isRestricted).to.be.true;
        });
      });

      context('Organization of the campaign is not managing student', () => {

        beforeEach(() => {
          orgaRepoStub.resolves(Object.assign(organization, { isManagingStudents: false }));
        });

        it('should resolve and return a campaign', async () => {
          // when
          const result = await usecases.retrieveCampaignInformation({ code: campaignCode });

          // then
          expect(result).to.be.instanceof(Campaign);
          expect(result.isRestricted).to.be.false;
        });
      });
    });
  });

});
