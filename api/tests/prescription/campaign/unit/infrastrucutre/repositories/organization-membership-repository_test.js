import { OrganizationMembership } from '../../../../../../src/prescription/campaign/domain/read-models/OrganizationMembership.js';
import { getByUserIdAndOrganizationId } from '../../../../../../src/prescription/campaign/infrastructure/repositories/organization-membership-repository.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Repositories | Organization Membership Repository', function () {
  it('should', async function () {
    // given
    const isAdminSymbol = Symbol('isAdmin');
    const userId = Symbol('userId');
    const organizationId = Symbol('organizationId');
    const organizationApiStub = {
      getOrganizationMembership: sinon.stub(),
    };
    organizationApiStub.getOrganizationMembership
      .withArgs({ userId, organizationId })
      .resolves({ isAdmin: isAdminSymbol });
    // when
    const membership = await getByUserIdAndOrganizationId({
      userId,
      organizationId,
      organizationApi: organizationApiStub,
    });
    // then
    expect(membership).to.be.an.instanceOf(OrganizationMembership);
    expect(membership.isAdmin).to.equal(isAdminSymbol);
  });
});
