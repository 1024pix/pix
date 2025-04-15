import { findPaginatedFilteredOrganizationCampaigns } from '../../../../../../src/prescription/campaign/domain/usecases/find-paginated-filtered-organization-campaigns.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Use Cases | find-paginated-filtered-organization-campaigns', function () {
  const campaignReportRepository = { findPaginatedFilteredByOrganizationId: () => undefined };

  beforeEach(function () {
    campaignReportRepository.findPaginatedFilteredByOrganizationId = sinon.stub();
    sinon.stub(DomainTransaction, 'execute');
    DomainTransaction.execute.callsFake((callback) => callback());
  });

  describe('#findPaginatedFilteredOrganizationCampaigns', function () {
    it('should return the campaigns of the given organization', function () {
      // given
      const organizationId = 251;
      const foundCampaign = domainBuilder.buildCampaign({ organizationId });
      const foundCampaigns = [foundCampaign];
      campaignReportRepository.findPaginatedFilteredByOrganizationId.resolves(foundCampaigns);
      const page = { number: 1, size: 3 };

      // when
      const promise = findPaginatedFilteredOrganizationCampaigns({
        organizationId,
        page,
        campaignReportRepository,
      });

      // then
      return promise.then((campaigns) => {
        expect(campaigns).to.have.lengthOf(1);
        expect(campaigns).to.contains(foundCampaign);
      });
    });
  });
});
