import { findChildrenOrganizationsForAdmin } from '../../../../lib/domain/usecases/find-children-organizations-for-admin.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Unit | Domain | UseCases | findChildrenOrganizationsForAdmin', function () {
  let organizationForAdminRepository;

  beforeEach(function () {
    organizationForAdminRepository = { exist: sinon.stub(), findChildrenByParentOrganizationId: sinon.stub() };
  });

  it('returns a list of child organizations', async function () {
    // given
    const parentOrganizationId = 1;
    const expectedChildOrganizations = Symbol('child organizations');
    organizationForAdminRepository.exist.resolves(true);
    organizationForAdminRepository.findChildrenByParentOrganizationId.resolves(expectedChildOrganizations);

    // when
    const childOrganizations = await findChildrenOrganizationsForAdmin({
      parentOrganizationId,
      organizationForAdminRepository,
    });

    // then
    expect(organizationForAdminRepository.exist).to.have.been.calledWithExactly(1);
    expect(organizationForAdminRepository.findChildrenByParentOrganizationId).to.have.been.calledWithExactly(1);
    expect(childOrganizations).to.equal(expectedChildOrganizations);
  });

  context('when parent organization does not exist', function () {
    it('throws a NotFound error', async function () {
      // given
      const parentOrganizationId = 1;
      organizationForAdminRepository.exist.resolves(false);

      // when
      const error = await catchErr(findChildrenOrganizationsForAdmin)({
        parentOrganizationId,
        organizationForAdminRepository,
      });

      // then
      expect(organizationForAdminRepository.exist).to.have.been.calledWithExactly(1);
      expect(organizationForAdminRepository.findChildrenByParentOrganizationId).to.not.have.been.called;
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Organization with ID (${parentOrganizationId}) not found`);
    });
  });
});
