import { Organization } from '../../../../../src/organizational-entities/domain/models/Organization.js';
import { getOrganizationDetails } from '../../../../../src/organizational-entities/domain/usecases/get-organization-details.usecase.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Domain | UseCase | get-organization-details', function () {
  it('should return the Organization matching the given organization ID', async function () {
    // given
    const organizationId = 1234;
    const foundOrganization = domainBuilder.buildOrganizationForAdmin({
      id: organizationId,
      email: 'sco.generic.account@example.net',
    });
    const organizationForAdminRepository = {
      get: sinon.stub().resolves(foundOrganization),
    };

    // when
    await getOrganizationDetails({ organizationId, organizationForAdminRepository });

    // then
    expect(organizationForAdminRepository.get).to.have.been.calledWithExactly(organizationId);
  });

  context('when the organization is a SCO-1D type', function () {
    it('should return the code for the given organizationId', async function () {
      // given
      const organizationId = 1234;
      const code = 'MINIPIXOU';
      const foundOrganization = domainBuilder.buildOrganization({
        id: organizationId,
        email: 'sco.generic.account@example.net',
        type: Organization.types.SCO1D,
      });
      const organizationForAdminRepository = {
        get: sinon.stub().resolves(foundOrganization),
      };
      const schoolRepository = {
        getById: sinon.stub().resolves(code),
      };

      // when
      const organization = await getOrganizationDetails({
        organizationId,
        organizationForAdminRepository,
        schoolRepository,
      });

      // then
      expect(schoolRepository.getById).to.have.been.calledWithExactly({ organizationId });
      expect(organization.code).to.deep.equal(code);
    });
  });
});
