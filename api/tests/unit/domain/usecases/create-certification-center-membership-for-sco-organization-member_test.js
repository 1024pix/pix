import { expect, sinon, domainBuilder } from '../../../test-helper';
import { createCertificationCenterMembershipForScoOrganizationMember } from '../../../../lib/domain/usecases';
import Membership from '../../../../lib/domain/models/Membership';

describe('Unit | UseCase | create-certification-center-membership-for-sco-organization-member', function () {
  let membershipRepository;
  let certificationCenterRepository;
  let certificationCenterMembershipRepository;

  beforeEach(function () {
    membershipRepository = {
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

  context('when the organizationRole is ADMIN', function () {
    context('when the organization is SCO', function () {
      context("when the membership's organization has a certification center", function () {
        context('when the user is already a member of the certification center', function () {
          it('should not create a certification center membership', async function () {
            // given
            const externalId = 'externalId';
            const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
            const givenMembership = new Membership({ id: 1, organizationRole: Membership.roles.ADMIN });
            const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
            const existingCertificationCenter = domainBuilder.buildCertificationCenter({ externalId });
            const existingMembership = domainBuilder.buildMembership({
              id: givenMembership.id,
              organizationRole: Membership.roles.MEMBER,
              organization,
              user: userWhoseOrganizationRoleIsToUpdate,
            });

            membershipRepository.get.withArgs(givenMembership.id).resolves(existingMembership);
            certificationCenterRepository.findByExternalId
              .withArgs({ externalId })
              .resolves(existingCertificationCenter);
            certificationCenterMembershipRepository.isMemberOfCertificationCenter
              .withArgs({
                userId: userWhoseOrganizationRoleIsToUpdate.id,
                certificationCenterId: existingCertificationCenter.id,
              })
              .resolves(true);

            // when
            await createCertificationCenterMembershipForScoOrganizationMember({
              membership: givenMembership,
              membershipRepository,
              certificationCenterRepository,
              certificationCenterMembershipRepository,
            });

            // then
            expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
          });
        });

        context('when the user is not yet a member of the certification center', function () {
          it('should create a certification center membership', async function () {
            // given
            const externalId = 'externalId';
            const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
            const givenMembership = new Membership({ id: 1, organizationRole: Membership.roles.ADMIN });
            const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
            const existingCertificationCenter = domainBuilder.buildCertificationCenter({ externalId });
            const existingMembership = domainBuilder.buildMembership({
              id: givenMembership.id,
              organizationRole: Membership.roles.MEMBER,
              organization,
              user: userWhoseOrganizationRoleIsToUpdate,
            });

            membershipRepository.get.withArgs(givenMembership.id).resolves(existingMembership);
            certificationCenterRepository.findByExternalId
              .withArgs({ externalId })
              .resolves(existingCertificationCenter);
            certificationCenterMembershipRepository.isMemberOfCertificationCenter
              .withArgs(userWhoseOrganizationRoleIsToUpdate.id, existingCertificationCenter.id)
              .resolves(false);

            // when
            await createCertificationCenterMembershipForScoOrganizationMember({
              membership: givenMembership,
              membershipRepository,
              certificationCenterRepository,
              certificationCenterMembershipRepository,
            });

            // then
            expect(certificationCenterMembershipRepository.save).to.have.been.calledWith({
              userId: userWhoseOrganizationRoleIsToUpdate.id,
              certificationCenterId: existingCertificationCenter.id,
            });
          });
        });
      });

      context("when the membership's organization has no certification center", function () {
        it('should not create a certification center membership', async function () {
          // given
          const externalId = 'externalId';
          const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
          const givenMembership = new Membership({ id: 1, organizationRole: Membership.roles.ADMIN });
          const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
          const existingMembership = domainBuilder.buildMembership({
            id: givenMembership.id,
            organizationRole: Membership.roles.MEMBER,
            organization,
            user: userWhoseOrganizationRoleIsToUpdate,
          });

          membershipRepository.get.withArgs(givenMembership.id).resolves(existingMembership);
          certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(null);

          // when
          await createCertificationCenterMembershipForScoOrganizationMember({
            membership: givenMembership,
            membershipRepository,
            certificationCenterRepository,
            certificationCenterMembershipRepository,
          });

          // then
          expect(certificationCenterMembershipRepository.isMemberOfCertificationCenter).to.not.have.been.called;
          expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
        });
      });
    });

    context('when the organization is not SCO', function () {
      it('should not create a certification center membership', async function () {
        // given
        const externalId = 'externalId';
        const organization = domainBuilder.buildOrganization({ externalId, type: 'SUP' });
        const givenMembership = new Membership({ id: 1, organizationRole: Membership.roles.ADMIN });
        const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
        const existingMembership = domainBuilder.buildMembership({
          id: givenMembership.id,
          organizationRole: Membership.roles.MEMBER,
          organization,
          user: userWhoseOrganizationRoleIsToUpdate,
        });

        membershipRepository.get.withArgs(givenMembership.id).resolves(existingMembership);

        // when
        await createCertificationCenterMembershipForScoOrganizationMember({
          membership: givenMembership,
          membershipRepository,
          certificationCenterRepository,
          certificationCenterMembershipRepository,
        });

        // then
        expect(certificationCenterRepository.findByExternalId).to.not.have.been.called;
        expect(certificationCenterMembershipRepository.isMemberOfCertificationCenter).to.not.have.been.called;
        expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
      });
    });

    context('when the organization has no external id', function () {
      it('should not create a certification center membership', async function () {
        // given
        const organization = domainBuilder.buildOrganization({ externalId: null, type: 'SCO' });
        const givenMembership = new Membership({ id: 1, organizationRole: Membership.roles.ADMIN });
        const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
        const existingMembership = domainBuilder.buildMembership({
          id: givenMembership.id,
          organizationRole: Membership.roles.MEMBER,
          organization,
          user: userWhoseOrganizationRoleIsToUpdate,
        });

        membershipRepository.get.withArgs(givenMembership.id).resolves(existingMembership);

        // when
        await createCertificationCenterMembershipForScoOrganizationMember({
          membership: givenMembership,
          membershipRepository,
          certificationCenterRepository,
          certificationCenterMembershipRepository,
        });

        // then
        expect(certificationCenterRepository.findByExternalId).to.not.have.been.called;
        expect(certificationCenterMembershipRepository.isMemberOfCertificationCenter).to.not.have.been.called;
        expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
      });
    });
  });

  context('when the organizationRole is MEMBER', function () {
    it('should not create a certification center membership', async function () {
      // given
      const externalId = 'externalId';
      const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
      const givenMembership = new Membership({ id: 1, organizationRole: Membership.roles.MEMBER });
      const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
      const existingMembership = domainBuilder.buildMembership({
        id: givenMembership.id,
        organizationRole: Membership.roles.MEMBER,
        organization,
        user: userWhoseOrganizationRoleIsToUpdate,
      });

      membershipRepository.get.withArgs(givenMembership.id).resolves(existingMembership);

      // when
      await createCertificationCenterMembershipForScoOrganizationMember({
        membership: givenMembership,
        membershipRepository,
        certificationCenterRepository,
        certificationCenterMembershipRepository,
      });

      // then
      expect(certificationCenterRepository.findByExternalId).to.not.have.been.called;
      expect(certificationCenterMembershipRepository.isMemberOfCertificationCenter).to.not.have.been.called;
      expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
    });
  });
});
