const { expect, sinon } = require('../../../test-helper');
const getOrganizationMembersIdentity = require('../../../../lib/domain/usecases/get-organization-members-identity');
const OrganizationMemberIdentity = require('../../../../lib/domain/models/OrganizationMemberIdentity');

describe('Unit | UseCase | get-organization-members', function () {
  let organizationMemberIdentityRepository;

  beforeEach(function () {
    organizationMemberIdentityRepository = {
      findAllByOrganizationId: sinon.stub(),
    };
  });

  it('should return organization members', async function () {
    // given
    const organizationId = 123;
    const member1 = new OrganizationMemberIdentity({ id: 444, firstName: 'Gérard', lastName: 'Menfaim' });
    const member2 = new OrganizationMemberIdentity({ id: 777, firstName: 'Guy', lastName: 'Tar' });
    organizationMemberIdentityRepository.findAllByOrganizationId
      .withArgs({ organizationId })
      .resolves([member1, member2]);

    // when
    const result = await getOrganizationMembersIdentity({
      organizationId,
      organizationMemberIdentityRepository,
    });

    // then
    const organizationMembers = [member1, member2];
    expect(result).to.be.deep.equal(organizationMembers);
  });
});
