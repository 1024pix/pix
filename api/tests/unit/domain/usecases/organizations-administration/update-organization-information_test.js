import { expect, sinon, catchErr, domainBuilder } from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { OrganizationForAdmin } from '../../../../../lib/domain/models/organizations-administration/OrganizationForAdmin.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
const { updateOrganizationInformation } = usecases;

describe('Unit | UseCase | organizations-administration | update-organization-information', function () {
  let organizationForAdminRepository, tagRepository;

  beforeEach(function () {
    organizationForAdminRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
    tagRepository = {
      findByIds: sinon.stub(),
    };
  });

  it('should update organization information', async function () {
    // given
    const givenOrganization = domainBuilder.buildOrganizationForAdmin();

    const existingOrganizationForAdmin = domainBuilder.buildOrganizationForAdmin({
      organizationId: givenOrganization.id,
    });
    sinon.stub(existingOrganizationForAdmin, 'updateWithDataProtectionOfficerAndTags');
    organizationForAdminRepository.get.onCall(0).returns(existingOrganizationForAdmin);
    const updatedOrganization = domainBuilder.buildOrganizationForAdmin({ organizationId: givenOrganization.id });
    organizationForAdminRepository.get.onCall(1).returns(updatedOrganization);
    const domainTransaction = Symbol('domainTransaction');
    const tagsToUpdate = Symbol('tagsToUpdate');
    tagRepository.findByIds.withArgs(givenOrganization.tagIds, domainTransaction).resolves(tagsToUpdate);
    // when
    const result = await updateOrganizationInformation({
      organization: givenOrganization,
      organizationForAdminRepository,
      tagRepository,
      domainTransaction,
    });

    // then
    expect(organizationForAdminRepository.get).to.have.been.calledWithExactly(givenOrganization.id, domainTransaction);
    expect(existingOrganizationForAdmin.updateWithDataProtectionOfficerAndTags).to.have.been.calledWithExactly(
      givenOrganization,
      givenOrganization.dataProtectionOfficer,
      tagsToUpdate,
    );
    expect(organizationForAdminRepository.update).to.have.been.calledWithExactly(
      existingOrganizationForAdmin,
      domainTransaction,
    );
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
