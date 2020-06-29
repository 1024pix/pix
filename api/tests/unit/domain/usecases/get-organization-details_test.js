const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getOrganizationDetails = require('../../../../lib/domain/usecases/get-organization-details');
const Organization = require('../../../../lib/domain/models/Organization');

describe('Unit | UseCase | get-organization-details', () => {

  it('should return the Organization matching the given organization ID', () => {
    // given
    const organizationId = 1234;
    const foundOrganization = domainBuilder.buildOrganization({ id: organizationId, email: 'sco.generic.account@example.net' });
    const organizationRepository = {
      get: sinon.stub().resolves(foundOrganization)
    };

    // when
    const promise = getOrganizationDetails({ organizationId, organizationRepository });

    // then
    return promise.then((organization) => {
      expect(organizationRepository.get).to.have.been.calledWith(organizationId);
      expect(organization).to.be.an.instanceOf(Organization);
      expect(organization).to.deep.equal(foundOrganization);
    });
  });
});
