import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { getOrganizationDetails } from '../../../../lib/domain/usecases/organizations-administration/get-organization-details.js';
import { Organization } from '../../../../lib/domain/models/Organization.js';

describe('Unit | UseCase | get-organization-details', function () {
  it('should return the Organization matching the given organization ID', async function () {
    // given
    const organizationId = 1234;
    const foundOrganization = domainBuilder.buildOrganization({
      id: organizationId,
      email: 'sco.generic.account@example.net',
    });
    const organizationForAdminRepository = {
      get: sinon.stub().resolves(foundOrganization),
    };

    // when
    const organization = await getOrganizationDetails({ organizationId, organizationForAdminRepository });

    // then
    expect(organizationForAdminRepository.get).to.have.been.calledWithExactly(organizationId);
    expect(organization).to.be.an.instanceOf(Organization);
    expect(organization).to.deep.equal(foundOrganization);
  });
});
