import { OrganizationForAdmin } from '../../../../../src/organizational-entities/domain/models/OrganizationForAdmin.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Domain | UseCase | update-organization-information', function () {
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
    const tagsToUpdate = Symbol('tagsToUpdate');
    tagRepository.findByIds.withArgs(givenOrganization.tagIds).resolves(tagsToUpdate);
    // when
    const result = await usecases.updateOrganizationInformation({
      organization: givenOrganization,
      organizationForAdminRepository,
      tagRepository,
    });

    // then
    expect(organizationForAdminRepository.get).to.have.been.calledWithExactly(givenOrganization.id);
    expect(existingOrganizationForAdmin.updateWithDataProtectionOfficerAndTags).to.have.been.calledWithExactly(
      givenOrganization,
      givenOrganization.dataProtectionOfficer,
      tagsToUpdate,
    );
    expect(organizationForAdminRepository.update).to.have.been.calledWithExactly(existingOrganizationForAdmin);
    expect(result).to.equal(updatedOrganization);
  });

  context('when an error occurred', function () {
    it('should reject a NotFoundError (DomainError) when the organization does not exist', async function () {
      // given
      const givenOrganization = new OrganizationForAdmin({ id: 8 });
      organizationForAdminRepository.get.rejects(new NotFoundError('Not found organization'));

      // when
      const error = await catchErr(usecases.updateOrganizationInformation)({
        organization: givenOrganization,
        organizationForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
