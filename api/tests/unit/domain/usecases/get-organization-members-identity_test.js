import { expect, sinon } from '../../../test-helper';
import getOrganizationMemberIdentities from '../../../../lib/domain/usecases/get-organization-members-identity';
import OrganizationMemberIdentity from '../../../../lib/domain/models/OrganizationMemberIdentity';

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
    const organizationMembers = [member1, member2];
    organizationMemberIdentityRepository.findAllByOrganizationId
      .withArgs({ organizationId })
      .resolves(organizationMembers);

    // when
    const result = await getOrganizationMemberIdentities({
      organizationId,
      organizationMemberIdentityRepository,
    });

    // then
    expect(result).to.be.deep.equal(organizationMembers);
  });
});
