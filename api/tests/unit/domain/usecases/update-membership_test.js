const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { updateMembership } = require('../../../../lib/domain/usecases');
const Membership = require('../../../../lib/domain/models/Membership');
const { InvalidMembershipOrganizationRoleError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | update-membership', () => {

  let membershipRepository;
  let certificationCenterRepository;
  let certificationCenterMembershipRepository;
  let organizationRepository;

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
      isMemberOfCertificationCenter: sinon.stub(),
    };
  });

  it('should update the membership', async () => {
    // given
    const organization = domainBuilder.buildOrganization({ type: 'SUP' });
    const membershipId = 100;
    const organizationRole = Membership.roles.ADMIN;
    const membership = new Membership({ id: membershipId, organization, organizationRole, updatedByUserId: 12345 });
    membershipRepository.get.resolves(domainBuilder.buildMembership());
    certificationCenterRepository.findByExternalId.resolves(null);

    // when
    await updateMembership({
      membershipId,
      membership,
      organizationId: organization.id,
      membershipRepository,
      certificationCenterRepository,
      certificationCenterMembershipRepository,
      organizationRepository,
    });

    // then
    expect(membershipRepository.updateById).to.has.been.calledWith({ id: membershipId, membership });
  });

  it('should throw a InvalidMembershipOrganizationRoleError if role is not valid', async () => {
    // given
    const organization = domainBuilder.buildOrganization({ type: 'SUP' });
    const membershipId = 100;
    const organizationRole = 'NOT_VALID_ROLE';
    const membership = new Membership({ id: membershipId, organization, organizationRole, updatedByUserId: 12345 });

    // when
    const error = await catchErr(updateMembership)({
      membershipId,
      membership,
      membershipRepository,
      certificationCenterRepository,
      certificationCenterMembershipRepository,
    });

    // then
    expect(error).to.an.instanceOf(InvalidMembershipOrganizationRoleError);
  });

  context('when the role to update is set to administrator', () => {

    context('when the membership\'s organization has a certification center', () => {
      it('should create a certification center membership', async () => {
        // given
        const membershipId = 1;
        const externalId = 'externalId';
        const organization = domainBuilder.buildOrganization({ type: 'SCO', externalId });
        const membership = new Membership({ organization, organizationRole: Membership.roles.ADMIN });
        const existingUser = domainBuilder.buildUser();
        const existingCertificationCenter = domainBuilder.buildCertificationCenter({ externalId });
        const existingMembership = domainBuilder.buildMembership({
          organization: organization,
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

      context('when the user is already a member of the certification center', () => {
        it('should not create a certification center membership', async () => {
          // given
          const membershipId = 1;
          const externalId = 'externalId';
          const organization = domainBuilder.buildOrganization({ externalId });
          const membership = new Membership({ organization, organizationRole: Membership.roles.ADMIN });
          const existingUser = domainBuilder.buildUser();
          const existingCertificationCenter = domainBuilder.buildCertificationCenter({ externalId });
          const existingMembership = domainBuilder.buildMembership({
            organization: organization,
            user: existingUser,
          });

          membershipRepository.get.withArgs(membershipId).resolves(existingMembership);
          certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(existingCertificationCenter);
          certificationCenterMembershipRepository.isMemberOfCertificationCenter.withArgs(existingUser.id, existingCertificationCenter.id).resolves(true);

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

      context('when the organization type is not SCO', () => {
        it('should not create a certification center membership', async () => {
          // given
          const externalId = 'externalId';
          const organization = domainBuilder.buildOrganization({ type: 'SUP', externalId });
          const existingUser = domainBuilder.buildUser();
          const existingCertificationCenter = domainBuilder.buildCertificationCenter({ externalId });
          const existingMembershipId = 1;
          const existingMembership = domainBuilder.buildMembership({
            id: existingMembershipId,
            organization,
            user: existingUser,
          });

          const membership = new Membership({ organization, organizationRole: Membership.roles.ADMIN });

          membershipRepository.get.withArgs(existingMembershipId).resolves(existingMembership);
          certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(existingCertificationCenter);

          // when
          await updateMembership({
            membershipId: existingMembershipId,
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

    context('when the membership\'s organization has no certification center', () => {
      it('should not create a certification center membership', async () => {
        // given
        const externalId = 'externalId';
        const organization = domainBuilder.buildOrganization({ externalId });
        const existingMembershipId = 1;
        const existingUser = domainBuilder.buildUser();
        const existingMembership = domainBuilder.buildMembership({
          id: existingMembershipId,
          organization: organization,
          user: existingUser,
        });

        const membership = new Membership({ organization, organizationRole: Membership.roles.ADMIN });

        membershipRepository.get.withArgs(existingMembershipId).resolves(existingMembership);
        certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(null);

        // when
        await updateMembership({
          membershipId: existingMembershipId,
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
      const organization = domainBuilder.buildOrganization({ type: 'SCO' });
      const membershipId = 1;
      const membership = new Membership({ organization, organizationRole: Membership.roles.MEMBER });

      const existingMembershipId = 1;
      const existingUser = domainBuilder.buildUser();
      const existingMembership = domainBuilder.buildMembership({
        id: existingMembershipId,
        organization: organization,
        user: existingUser,
      });
      membershipRepository.get.withArgs(membershipId).resolves(existingMembership);

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

