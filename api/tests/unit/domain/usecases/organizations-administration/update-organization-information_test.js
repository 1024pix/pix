import { expect, sinon, catchErr, domainBuilder } from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { OrganizationForAdmin } from '../../../../../lib/domain/models/organizations-administration/OrganizationForAdmin.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
const { updateOrganizationInformation } = usecases;

describe('Unit | UseCase | organizations-administration | update-organization-information', function () {
  let organizationForAdminRepository;

  beforeEach(function () {
    organizationForAdminRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
  });

  it('should update organization information', async function () {
    // given
    const givenOrganization = domainBuilder.buildOrganizationForAdmin();

    const existingOrganizationForAdmin = domainBuilder.buildOrganizationForAdmin({
      organizationId: givenOrganization.id,
    });
    sinon.stub(existingOrganizationForAdmin, 'updateInformation');
    organizationForAdminRepository.get.onCall(0).returns(existingOrganizationForAdmin);
    const updatedOrganization = domainBuilder.buildOrganizationForAdmin({ organizationId: givenOrganization.id });
    organizationForAdminRepository.get.onCall(1).returns(updatedOrganization);

    // when
    const result = await updateOrganizationInformation({
      organization: givenOrganization,
      organizationForAdminRepository,
    });

    // then
    expect(organizationForAdminRepository.get).to.have.been.calledWith(givenOrganization.id);
    expect(existingOrganizationForAdmin.updateInformation).to.have.been.calledWith(
      givenOrganization,
      givenOrganization.dataProtectionOfficer,
      givenOrganization.tags,
    );
    expect(organizationForAdminRepository.update).to.have.been.calledWith(existingOrganizationForAdmin);
    expect(result).to.equal(updatedOrganization);
  });

  context('when an error occurred', function () {
    it('should reject a NotFoundError (DomainError) when the organization does not exist', async function () {
      // given
      const givenOrganization = new OrganizationForAdmin({ id: 8 });
      organizationForAdminRepository.get.rejects(new NotFoundError('Not found organization'));

      // when
      const error = await catchErr(updateOrganizationInformation)({
        organization: givenOrganization,
        organizationForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
