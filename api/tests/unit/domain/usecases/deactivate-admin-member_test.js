const { sinon, expect } = require('../../../test-helper');
const deactivateAdminMember = require('../../../../lib/domain/usecases/deactivate-admin-member');

describe('Unit | UseCase | deactivate-admin-member', function () {
  it('should deactivate the given admin member', async function () {
    // given
    const adminMemberRepository = { deactivate: sinon.stub() };

    adminMemberRepository.deactivate.withArgs({ id: 7 }).resolves(undefined);

    // when
    const adminMember = await deactivateAdminMember({
      id: 7,
      adminMemberRepository,
    });

    // then
    expect(adminMember).to.be.undefined;
  });
});
