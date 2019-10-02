const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | retrieve-campaign-information', () => {

  const organizationId = 'organizationId';
  const campaignCode = 'QWERTY123';
  const campaign = { code: campaignCode, organizationId };
  const campaignRepository = {};
  const testError = 'some error';

  beforeEach(() => {
    campaignRepository.getByCode = sinon.stub();
  });

  context('the campaign was retrieved by code', () => {
    context('the campaign exists', () => {
      beforeEach(() => {
        campaignRepository.getByCode.returns(Promise.resolve(campaign));
      });

      it('should return the campaign ', async () => {
        // when
        const res = await usecases.retrieveCampaignInformation({ code: campaignCode, campaignRepository });

        // then
        expect(res).to.deep.equal(campaign);
      });

      it('should have fetched the campaign by code', async () => {
        // when
        await usecases.retrieveCampaignInformation({ code: campaignCode, campaignRepository });

        // then
        expect(campaignRepository.getByCode).to.have.been.calledWithExactly(campaignCode);
      });
    });

    context('the campaign does not exist', async () => {
      beforeEach(() => {
        campaignRepository.getByCode.returns(Promise.resolve(null));
      });

      it('should throw a NotFound error', async () => {
        // when
        try {
          await usecases.retrieveCampaignInformation({ code: campaignCode, campaignRepository });
        }

        // then
        catch (error) {
          expect(error).to.be.instanceOf(NotFoundError);
        }
      });
    });
  });

  context('the campaign couldn\'t be retrieved', () => {
    beforeEach(() => {
      campaignRepository.getByCode.returns(Promise.reject(testError));
    });

    it('should throw an Internal error', async () => {
      // when
      try {
        await usecases.retrieveCampaignInformation({ code: campaignCode, campaignRepository });
      }

      // then
      catch (error) {
        expect(error).to.be.deep.equal(testError);
      }
    });
  });
});
