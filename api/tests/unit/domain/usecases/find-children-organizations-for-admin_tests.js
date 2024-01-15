import { catchErr, expect, sinon } from '../../../test-helper.js';
import { findChildrenOrganizationsForAdmin } from '../../../../lib/domain/usecases/find-children-organizations-for-admin.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | UseCases | findChildrenOrganizationsForAdmin', function () {
  let organizationRepository;

  beforeEach(function () {
    organizationRepository = { exist: sinon.stub(), findChildrenByParentOrganizationId: sinon.stub() };
  });

  it('returns a list of child organizations', async function () {
    // given
    const parentOrganizationId = 1;
    const expectedChildOrganizations = Symbol('child organizations');
    organizationRepository.exist.resolves(true);
    organizationRepository.findChildrenByParentOrganizationId.resolves(expectedChildOrganizations);

    // when
    const childOrganizations = await findChildrenOrganizationsForAdmin({
      parentOrganizationId,
      organizationRepository,
    });

    // then
    expect(organizationRepository.exist).to.have.been.calledWithExactly(1);
    expect(organizationRepository.findChildrenByParentOrganizationId).to.have.been.calledWithExactly(1);
    expect(childOrganizations).to.equal(expectedChildOrganizations);
  });

  context('when parent organization does not exist', function () {
    it('throws a NotFound error', async function () {
      // given
      const parentOrganizationId = 1;
      organizationRepository.exist.resolves(false);

      // when
      const error = await catchErr(findChildrenOrganizationsForAdmin)({
        parentOrganizationId,
        organizationRepository,
      });

      // then
      expect(organizationRepository.exist).to.have.been.calledWithExactly(1);
      expect(organizationRepository.findChildrenByParentOrganizationId).to.not.have.been.called;
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Organization with ID (${parentOrganizationId}) not found`);
    });
  });
});
