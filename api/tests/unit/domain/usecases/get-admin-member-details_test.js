import { getAdminMemberDetails } from '../../../../lib/domain/usecases/get-admin-member-details.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | get-admin-member-details', function () {
  it('should return an admin member details', async function () {
    // given
    const adminMemberRepository = {
      get: sinon.stub(),
    };
    const adminMember = domainBuilder.buildAdminMember();
    adminMemberRepository.get.withArgs({ userId: adminMember.id }).resolves(adminMember);

    // when
    const adminMemberDetails = await getAdminMemberDetails({ adminMemberRepository, userId: adminMember.id });

    // then
    expect(adminMemberDetails).to.deep.equal(adminMember);
  });
});
