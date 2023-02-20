import { expect, sinon } from '../../../test-helper';
import findUserOrganizationsForAdmin from '../../../../lib/domain/usecases/find-user-organizations-for-admin';

describe('Unit | UseCase | findUserOrganizationsForAdmin', function () {
  it('should fetch user’s organization memberships', async function () {
    const userId = 1;

    const userOrganizationsForAdminRepository = {
      findByUserId: sinon.stub(),
    };
    const expectedOrganizationMemberships = ['A dummy value to check that function is called with good params'];
    userOrganizationsForAdminRepository.findByUserId.withArgs(userId).resolves(expectedOrganizationMemberships);

    const foundOrganizationMemberships = await findUserOrganizationsForAdmin({
      userId,
      userOrganizationsForAdminRepository,
    });

    expect(foundOrganizationMemberships).to.deep.equal(expectedOrganizationMemberships);
  });
});
