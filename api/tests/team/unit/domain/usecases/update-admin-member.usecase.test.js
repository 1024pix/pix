import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { updateAdminMember } from '../../../../../src/team/domain/usecases/update-admin-member.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Unit | Team | Domain | UseCase | update-admin-member', function () {
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
