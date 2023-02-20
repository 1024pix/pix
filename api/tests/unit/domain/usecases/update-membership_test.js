import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper';
import { updateMembership } from '../../../../lib/domain/usecases';
import Membership from '../../../../lib/domain/models/Membership';
import { InvalidMembershipOrganizationRoleError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | update-membership', function () {
  let membershipRepository;

  beforeEach(function () {
    membershipRepository = {
      updateById: sinon.stub(),
      get: sinon.stub(),
    };
  });

  it('should throw a InvalidMembershipOrganizationRoleError if role is not valid', async function () {
    // given
    const membershipId = 100;
    const organizationRole = 'NOT_VALID_ROLE';
    const membership = new Membership({ id: membershipId, organizationRole });

    // when
    const error = await catchErr(updateMembership)({
      membership,
      membershipRepository,
    });

    // then
    expect(error).to.an.instanceOf(InvalidMembershipOrganizationRoleError);
  });

  it('should update the membership', async function () {
    // given
    const organization = domainBuilder.buildOrganization({ type: 'SUP' });
    const membershipId = 100;
    const givenMembership = new Membership({
      id: membershipId,
      organizationRole: Membership.roles.MEMBER,
      updatedByUserId: 123,
    });
    const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
    const existingMembership = domainBuilder.buildMembership({
      id: membershipId,
      organizationRole: Membership.roles.ADMIN,
      organization,
      user: userWhoseOrganizationRoleIsToUpdate,
    });
    const membershipWithRelatedUserAndOrganization = Symbol('a membership with related informations');
    membershipRepository.get.withArgs(membershipId).resolves(existingMembership);
    membershipRepository.updateById
      .withArgs({ id: membershipId, membership: givenMembership })
      .resolves(membershipWithRelatedUserAndOrganization);

    // when
    const result = await updateMembership({
      membership: givenMembership,
      membershipRepository,
    });

    // then
    expect(result).to.equal(membershipWithRelatedUserAndOrganization);
  });
});
