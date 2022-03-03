const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getOrganizationDetails = require('../../../../lib/domain/usecases/get-organization-details');
const Organization = require('../../../../lib/domain/models/Organization');

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
    expect(organizationForAdminRepository.get).to.have.been.calledWith(organizationId);
    expect(organization).to.be.an.instanceOf(Organization);
    expect(organization).to.deep.equal(foundOrganization);
  });
});
