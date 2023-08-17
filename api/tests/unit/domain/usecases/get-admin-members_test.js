import { getAdminMembers } from '../../../../lib/domain/usecases/get-admin-members.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-admin-members', function () {
  it('should return all admin members', async function () {
    // given
    const adminMemberRepository = {
      findAll: sinon.stub(),
    };
    const adminMember = domainBuilder.buildAdminMember();
    const otherAdminMember = domainBuilder.buildAdminMember();
    adminMemberRepository.findAll.resolves([adminMember, otherAdminMember]);

    // when
    const adminMembers = await getAdminMembers({ adminMemberRepository });

    // then
    expect(adminMembers).to.deep.equal([adminMember, otherAdminMember]);
  });
});
