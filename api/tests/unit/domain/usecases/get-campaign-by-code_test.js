const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { NotFoundError, InternalError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-campaign-by-code', () => {

  let sandbox;
  let requestErr;
  let requestResult;

  const organizationId = 'organizationId';
  const campaignCode = 'QWERTY123';
  const campaign = { code: campaignCode, organizationId };
  const organization = { id: organizationId, logoUrl: 'a logo url' };
  const campaignRepository = {};
  const organizationRepository = {};
  const augmentedCampaign = Object.assign({}, campaign, { organizationLogoUrl: organization.logoUrl });
  const testError = 'some error';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    campaignRepository.getByCode = sandbox.stub();
    organizationRepository.get = sandbox.stub();
    requestErr = null;
    requestResult = null;
  });

  afterEach(() => {
    sandbox.restore();
  });
  
  context('the campaign was retrieved by code', () => {
    context('the campaign exists', () => {
      beforeEach(() => {
        // Given
        campaignRepository.getByCode.returns(Promise.resolve(campaign));
      });
      context('the related organization was retrieved', () => {
        context('the relation organization did exist', () => {
          beforeEach(() => {
            // Given
            organizationRepository.get.returns(Promise.resolve(organization));

            // When
            return usecases.getCampaignByCode({ code: campaignCode, campaignRepository, organizationRepository })
              .then((res) => requestResult = res);
          });
          it('should return the campaign augmented with organization logo', function() {
            expect(requestResult).to.deep.equal(augmentedCampaign);
          });
          it('should have fetched the campaign by code', () => {
            expect(campaignRepository.getByCode).to.have.been.calledWithExactly(campaignCode);
          });
          it('should have fetched the organization by id', () => {
            expect(organizationRepository.get).to.have.been.calledWithExactly(organizationId);
          });
        });
      });
      context('the related organization did not exist', () => {
        beforeEach(() => {
          // Given
          organizationRepository.get.returns(Promise.resolve(null));

          // When
          return usecases.getCampaignByCode({ code: campaignCode, campaignRepository, organizationRepository })
            .catch((err) => requestErr = err);
        });
        it('should throw an Internal error', () => {
          // Then
          expect(requestErr).to.be.instanceOf(InternalError);
        });
      });
      context('the related organization could not be retrieved', () => {
        beforeEach(() => {
          // Given
          organizationRepository.get.returns(Promise.reject(testError));

          // When
          return usecases.getCampaignByCode({ code: campaignCode, campaignRepository, organizationRepository })
            .catch((err) => requestErr = err);
        });
        it('should forward the error', () => {
          // Then
          expect(requestErr).to.deep.equal(testError);
        });
      });
    });
    context('the campaign does not exist', () => {
      beforeEach(() => {
        // Given
        campaignRepository.getByCode.returns(Promise.resolve(null));

        // When
        return usecases.getCampaignByCode({ code: campaignCode, campaignRepository, organizationRepository })
          .catch((err) => requestErr = err);
      });
      it('should throw a NotFound error', () => {
        // Then
        expect(requestErr).to.be.instanceOf(NotFoundError);
      });
    });
  });
  context('the campaign couldn\'t be retrieved', () => {
    beforeEach(() => {
      // Given
      campaignRepository.getByCode.returns(Promise.reject(testError));

      // When
      return usecases.getCampaignByCode({ code: campaignCode, campaignRepository, organizationRepository })
        .catch((err) => requestErr = err);
    });
    it('should throw an Internal error', () => {
      // Then
      expect(requestErr).to.deep.equal(testError);
    });
  });

});
