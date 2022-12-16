const { expect, sinon } = require('../../../test-helper');
const updateAdminMember = require('../../../../lib/domain/usecases/update-admin-member');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;

describe('Unit | UseCase | update-admin-member', function () {
  it('should update the given admin member', async function () {
    // given
    const adminMemberRepository = { update: sinon.stub() };

    const updatedAdminMember = Symbol('pix admin role saved');
    const attributesToUpdate = { role: ROLES.METIER };
    adminMemberRepository.update.withArgs({ id: 7, attributesToUpdate }).resolves(updatedAdminMember);

    // when
    const adminMember = await updateAdminMember({
      id: 7,
      role: ROLES.METIER,
      adminMemberRepository,
    });

    // then
    expect(adminMember).to.deep.equal(updatedAdminMember);
  });
});
