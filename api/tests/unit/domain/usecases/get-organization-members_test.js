const { expect, sinon } = require('../../../test-helper');
const getOrganizationMembers = require('../../../../lib/domain/usecases/get-organization-members');
const OrganizationMember = require('../../../../lib/domain/models/OrganizationMember');

describe('Unit | UseCase | get-organization-members', function () {
  let organizationMemberRepository;

  beforeEach(function () {
    organizationMemberRepository = {
      findAllByOrganizationId: sinon.stub(),
    };
  });

  it('should return organization members', async function () {
    // given
    const organizationId = 123;
    const member1 = new OrganizationMember({ id: 444, firstName: 'Gérard', lastName: 'Menfaim' });
    const member2 = new OrganizationMember({ id: 777, firstName: 'Guy', lastName: 'Tar' });
    organizationMemberRepository.findAllByOrganizationId.withArgs({ organizationId }).resolves([member1, member2]);

    // when
    const result = await getOrganizationMembers({
      organizationId,
      organizationMemberRepository,
    });

    // then
    const organizationMembers = [member1, member2];
    expect(result).to.be.deep.equal(organizationMembers);
  });
});
