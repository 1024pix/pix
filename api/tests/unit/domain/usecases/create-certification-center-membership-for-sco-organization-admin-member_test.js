import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { createCertificationCenterMembershipForScoOrganizationAdminMember } from '../../../../lib/domain/usecases/create-certification-center-membership-for-sco-organization-admin-member.js';
import { Membership } from '../../../../lib/domain/models/Membership.js';
import {
  CERTIFICATION_CENTER_MEMBERSHIP_ROLES,
  CertificationCenterMembership,
} from '../../../../lib/domain/models/CertificationCenterMembership.js';

describe('Unit | UseCase | create-certification-center-membership-for-sco-organization-member', function () {
  const now = new Date('2023-11-01');
  let membershipRepository;
  let certificationCenterRepository;
  let certificationCenterMembershipRepository;
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
    membershipRepository = {
      get: sinon.stub(),
    };
    certificationCenterRepository = {
      findByExternalId: sinon.stub(),
    };
    certificationCenterMembershipRepository = {
      isMemberOfCertificationCenter: sinon.stub(),
      create: sinon.stub(),
      findByCertificationCenterIdAndUserId: sinon.stub(),
      update: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  context('when the organizationRole is ADMIN', function () {
    context('when the organization is SCO', function () {
      context("when the membership's organization has a certification center", function () {
        context('when organization member is not yet a member of the certification center', function () {
          it('creates a certification center membership with role "ADMIN"', async function () {
            // given
            const externalId = 'externalId';
            const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
            const organizationMembership = new Membership({
              id: 1,
              organizationRole: Membership.roles.ADMIN,
            });
            const user = domainBuilder.buildUser();
            const existingOrganizationMembership = domainBuilder.buildMembership({
              id: organizationMembership.id,
              organizationRole: Membership.roles.MEMBER,
              organization,
              user,
            });
            const certificationCenter = domainBuilder.buildCertificationCenter({ externalId });

            membershipRepository.get.withArgs(organizationMembership.id).resolves(existingOrganizationMembership);
            certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(certificationCenter);
            certificationCenterMembershipRepository.findByCertificationCenterIdAndUserId
              .withArgs({ certificationCenterId: certificationCenter.id, userId: user.id })
              .resolves(null);

            // when
            await createCertificationCenterMembershipForScoOrganizationAdminMember({
              membership: organizationMembership,
              membershipRepository,
              certificationCenterRepository,
              certificationCenterMembershipRepository,
            });

            // then
            expect(certificationCenterMembershipRepository.create).to.have.been.calledWithExactly({
              userId: user.id,
              certificationCenterId: certificationCenter.id,
              role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN,
            });
            expect(certificationCenterMembershipRepository.update).to.not.have.been.called;
          });
        });

        context('when organization is member of the certification center', function () {
          context('with role "MEMBER"', function () {
            it('updates the certification center membership role to "ADMIN"', async function () {
              // given
              const externalId = 'externalId';
              const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
              const organizationMembership = new Membership({
                id: 1,
                organizationRole: Membership.roles.ADMIN,
                updatedByUserId: 20231112,
              });
              const user = domainBuilder.buildUser();
              const existingOrganizationMembership = domainBuilder.buildMembership({
                id: organizationMembership.id,
                organizationRole: Membership.roles.MEMBER,
                organization,
                user,
              });
              const certificationCenter = domainBuilder.buildCertificationCenter({ externalId });
              const certificationCenterMembership = new CertificationCenterMembership({
                role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
              });
              const updatedCertificationCenterMembership = new CertificationCenterMembership({
                ...certificationCenterMembership,
                role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN,
                updatedByUserId: 20231112,
                updatedAt: now,
              });

              membershipRepository.get.withArgs(organizationMembership.id).resolves(existingOrganizationMembership);
              certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(certificationCenter);
              certificationCenterMembershipRepository.findByCertificationCenterIdAndUserId
                .withArgs({ certificationCenterId: certificationCenter.id, userId: user.id })
                .resolves(certificationCenterMembership);

              // when
              await createCertificationCenterMembershipForScoOrganizationAdminMember({
                membership: organizationMembership,
                membershipRepository,
                certificationCenterRepository,
                certificationCenterMembershipRepository,
              });

              // then
              expect(certificationCenterMembershipRepository.create).to.not.have.been.called;
              expect(certificationCenterMembershipRepository.update).to.have.been.calledWithExactly(
                updatedCertificationCenterMembership,
              );
            });
          });

          context('with role "ADMIN"', function () {
            it('does nothing', async function () {
              // given
              const externalId = 'externalId';
              const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
              const organizationMembership = new Membership({
                id: 1,
                organizationRole: Membership.roles.ADMIN,
              });
              const user = domainBuilder.buildUser();
              const existingOrganizationMembership = domainBuilder.buildMembership({
                id: organizationMembership.id,
                organizationRole: Membership.roles.MEMBER,
                organization,
                user,
              });
              const certificationCenter = domainBuilder.buildCertificationCenter({ externalId });
              const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
                role: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.ADMIN,
              });

              membershipRepository.get.withArgs(organizationMembership.id).resolves(existingOrganizationMembership);
              certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(certificationCenter);
              certificationCenterMembershipRepository.findByCertificationCenterIdAndUserId
                .withArgs({ certificationCenterId: certificationCenter.id, userId: user.id })
                .resolves(certificationCenterMembership);

              // when
              await createCertificationCenterMembershipForScoOrganizationAdminMember({
                membership: organizationMembership,
                membershipRepository,
                certificationCenterRepository,
                certificationCenterMembershipRepository,
              });

              // then
              expect(certificationCenterMembershipRepository.create).to.not.have.been.called;
              expect(certificationCenterMembershipRepository.update).to.not.have.been.called;
            });
          });
        });
      });

      context("when the membership's organization has no certification center", function () {
        it('should not create a certification center membership', async function () {
          // given
          const externalId = 'externalId';
          const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
          const givenMembership = new Membership({
            id: 1,
            organizationRole: Membership.roles.ADMIN,
          });
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
          await createCertificationCenterMembershipForScoOrganizationAdminMember({
            membership: givenMembership,
            membershipRepository,
            certificationCenterRepository,
            certificationCenterMembershipRepository,
          });

          // then
          expect(certificationCenterMembershipRepository.isMemberOfCertificationCenter).to.not.have.been.called;
          expect(certificationCenterMembershipRepository.create).to.not.have.been.called;
        });
      });

      context('when the organization is not SCO', function () {
        it('should not create a certification center membership', async function () {
          // given
          const externalId = 'externalId';
          const organization = domainBuilder.buildOrganization({ externalId, type: 'SUP' });
          const givenMembership = new Membership({
            id: 1,
            organizationRole: Membership.roles.ADMIN,
          });
          const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
          const existingMembership = domainBuilder.buildMembership({
            id: givenMembership.id,
            organizationRole: Membership.roles.MEMBER,
            organization,
            user: userWhoseOrganizationRoleIsToUpdate,
          });

          membershipRepository.get.withArgs(givenMembership.id).resolves(existingMembership);

          // when
          await createCertificationCenterMembershipForScoOrganizationAdminMember({
            membership: givenMembership,
            membershipRepository,
            certificationCenterRepository,
            certificationCenterMembershipRepository,
          });

          // then
          expect(certificationCenterRepository.findByExternalId).to.not.have.been.called;
          expect(certificationCenterMembershipRepository.isMemberOfCertificationCenter).to.not.have.been.called;
          expect(certificationCenterMembershipRepository.create).to.not.have.been.called;
        });
      });

      context('when the organization has no external id', function () {
        it('should not create a certification center membership', async function () {
          // given
          const organization = domainBuilder.buildOrganization({ externalId: null, type: 'SCO' });
          const givenMembership = new Membership({
            id: 1,
            organizationRole: Membership.roles.ADMIN,
          });
          const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
          const existingMembership = domainBuilder.buildMembership({
            id: givenMembership.id,
            organizationRole: Membership.roles.MEMBER,
            organization,
            user: userWhoseOrganizationRoleIsToUpdate,
          });

          membershipRepository.get.withArgs(givenMembership.id).resolves(existingMembership);

          // when
          await createCertificationCenterMembershipForScoOrganizationAdminMember({
            membership: givenMembership,
            membershipRepository,
            certificationCenterRepository,
            certificationCenterMembershipRepository,
          });

          // then
          expect(certificationCenterRepository.findByExternalId).to.not.have.been.called;
          expect(certificationCenterMembershipRepository.isMemberOfCertificationCenter).to.not.have.been.called;
          expect(certificationCenterMembershipRepository.create).to.not.have.been.called;
        });
      });
    });

    context('when the organizationRole is MEMBER', function () {
      it('should not create a certification center membership', async function () {
        // given
        const externalId = 'externalId';
        const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
        const givenMembership = new Membership({
          id: 1,
          organizationRole: Membership.roles.MEMBER,
        });
        const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
        const existingMembership = domainBuilder.buildMembership({
          id: givenMembership.id,
          organizationRole: Membership.roles.MEMBER,
          organization,
          user: userWhoseOrganizationRoleIsToUpdate,
        });

        membershipRepository.get.withArgs(givenMembership.id).resolves(existingMembership);

        // when
        await createCertificationCenterMembershipForScoOrganizationAdminMember({
          membership: givenMembership,
          membershipRepository,
          certificationCenterRepository,
          certificationCenterMembershipRepository,
        });

        // then
        expect(certificationCenterRepository.findByExternalId).to.not.have.been.called;
        expect(certificationCenterMembershipRepository.isMemberOfCertificationCenter).to.not.have.been.called;
        expect(certificationCenterMembershipRepository.create).to.not.have.been.called;
      });
    });
  });
});
