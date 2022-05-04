const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getAdminMemberDetails = require('../../../../lib/domain/usecases/get-admin-member-details');

describe('Unit | UseCase | get-admin-member-details', function () {
  it('should return an admin member details', async function () {
    // given
    const adminMemberRepository = {
      get: sinon.stub(),
    };
    const adminMember = domainBuilder.buildAdminMember();
    adminMemberRepository.get.withArgs({ userId: adminMember.id }).resolves(adminMember);

    // when
    const adminMembers = await getAdminMemberDetails({ adminMemberRepository, userId: adminMember.id });

    // then
    expect(adminMembers).to.deep.equal(adminMember);
  });
});
