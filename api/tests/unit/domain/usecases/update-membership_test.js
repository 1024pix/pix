const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { updateMembership } = require('../../../../lib/domain/usecases');
const Membership = require('../../../../lib/domain/models/Membership');
const { InvalidMembershipRoleError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-membership', () => {

  let membershipRepository;
  let certificationCenterRepository;
  let certificationCenterMembershipRepository;

  beforeEach(() => {
    membershipRepository = {
      updateById: sinon.stub(),
      get: sinon.stub(),
    };
    certificationCenterRepository = {
      findByExternalId: sinon.stub(),
    };
    certificationCenterMembershipRepository = {
      save: sinon.stub(),
    };
  });

  it('should update the membership', async () => {
    // given
    const membershipId = 100;
    const organizationRole = Membership.roles.ADMIN;
    const membership = new Membership({ id: membershipId, organizationRole, updatedByUserId: 12345 });
    membershipRepository.get.resolves(domainBuilder.buildMembership());
    certificationCenterRepository.findByExternalId.resolves(null);

    // when
    await updateMembership({
      membershipId,
      membership,
      membershipRepository,
      certificationCenterRepository,
      certificationCenterMembershipRepository,
    });

    // then
    expect(membershipRepository.updateById).to.has.been.calledWith({ id: membershipId, membership });
  });

  it('should throw a InvalidMembershipRoleError if role is not valid', async () => {
    // given
    const membershipId = 100;
    const organizationRole = 'NOT_VALID_ROLE';
    const membership = new Membership({ id: membershipId, organizationRole, updatedByUserId: 12345 });

    // when
    const error = await catchErr(updateMembership)({
      membershipId,
      membership,
      membershipRepository,
      certificationCenterRepository,
      certificationCenterMembershipRepository,
    });

    // then
    expect(error).to.an.instanceOf(InvalidMembershipRoleError);
  });

  context('when the role to update is set to administrator', () => {

    context('when the membership\'s organization has a certification center', () => {
      it('should create a certification center membership', async () => {
        // given
        const membershipId = 1;
        const externalId = 'externalId';
        const membership = new Membership({ organizationRole: Membership.roles.ADMIN });
        const existingOrganization = domainBuilder.buildOrganization({ externalId });
        const existingUser = domainBuilder.buildUser();
        const existingCertificationCenter = domainBuilder.buildCertificationCenter({ externalId });
        const existingMembership = domainBuilder.buildMembership({
          organization: existingOrganization,
          user: existingUser,
        });

        membershipRepository.get.withArgs(membershipId).resolves(existingMembership);
        certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(existingCertificationCenter);

        // when
        await updateMembership({
          membershipId,
          membership,
          membershipRepository,
          certificationCenterRepository,
          certificationCenterMembershipRepository,
        });

        // then
        expect(certificationCenterMembershipRepository.save).to.have.been.calledWith(existingUser.id, existingCertificationCenter.id);
      });
    });

    context('when the membership\'s organization has no certification center', () => {
      it('should not create a certification center membership', async () => {
        // given
        const membershipId = 1;
        const externalId = 'externalId';
        const membership = new Membership({ organizationRole: Membership.roles.ADMIN });
        const existingOrganization = domainBuilder.buildOrganization({ externalId });
        const existingUser = domainBuilder.buildUser();
        const existingMembership = domainBuilder.buildMembership({
          organization: existingOrganization,
          user: existingUser,
        });

        membershipRepository.get.withArgs(membershipId).resolves(existingMembership);
        certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(null);

        // when
        await updateMembership({
          membershipId,
          membership,
          membershipRepository,
          certificationCenterRepository,
          certificationCenterMembershipRepository,
        });

        // then
        expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
      });
    });
  });

  context('when the role to update is set to member', () => {
    it('should not create a certification center membership', async () => {
      // given
      const membershipId = 1;
      const membership = new Membership({ organizationRole: Membership.roles.MEMBER });

      // when
      await updateMembership({
        membershipId,
        membership,
        membershipRepository,
        certificationCenterRepository,
        certificationCenterMembershipRepository,
      });

      // then
      expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
    });
  });

});

