const { expect } = require('../../../test-helper');

const useCase = require('../../../../lib/domain/usecases/');


describe('Unit | Domain | Use Cases | get-organization-campaigns', () => {

  beforeEach(() => {
  });

  afterEach(() => {
  });

  describe('#getOrganizationCampaigns', () => {

    it('should return the campaigns of the given organization', () => {
      // given
      const organizationId = 251;
      // when
      const promise = useCase.getOrganizationCampaigns({ organizationId });

      // then
      return promise.then(() => {
        expect(campaignRepository.getByOrganization).to.have.been.calledWith(organizationId);
      });
    });

  });
});
