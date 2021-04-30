const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { updateMembership } = require('../../../../lib/domain/usecases');
const Membership = require('../../../../lib/domain/models/Membership');
const { InvalidMembershipOrganizationRoleError } = require('../../../../lib/domain/errors');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

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
      isMemberOfCertificationCenter: sinon.stub(),
    };
  });

  it('should throw a InvalidMembershipOrganizationRoleError if role is not valid', async () => {
    // given
    const membershipId = 100;
    const organizationRole = 'NOT_VALID_ROLE';
    const membership = new Membership({ id: membershipId, organizationRole });

    // when
    const error = await catchErr(updateMembership)({
      membership,
      membershipRepository,
      certificationCenterRepository,
      certificationCenterMembershipRepository,
    });

    // then
    expect(error).to.an.instanceOf(InvalidMembershipOrganizationRoleError);
  });

  context('when the organizationRole to update is set to administrator', () => {

    context('when the organization is SCO', () => {

      context('when the membership\'s organization has a certification center', () => {

        context('when the user is already a member of the certification center', () => {

          it('should not create a certification center membership', async () => {
          // given
            const membershipId = 1;
            const externalId = 'externalId';
            const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
            const givenMembership = new Membership({ id: membershipId, organizationRole: Membership.roles.ADMIN });
            const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
            const existingCertificationCenter = domainBuilder.buildCertificationCenter({ externalId });
            const existingMembership = domainBuilder.buildMembership({
              id: membershipId,
              organizationRole: Membership.roles.MEMBER,
              organization: organization,
              user: userWhoseOrganizationRoleIsToUpdate,
            });

            membershipRepository.get.withArgs(membershipId).resolves(existingMembership);
            certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(existingCertificationCenter);
            certificationCenterMembershipRepository.isMemberOfCertificationCenter
              .withArgs(userWhoseOrganizationRoleIsToUpdate.id, existingCertificationCenter.id).resolves(true);

            // when
            await updateMembership({
              membership: givenMembership,
              membershipRepository,
              certificationCenterRepository,
              certificationCenterMembershipRepository,
            });

            // then
            expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
          });
        });

        context('when the user is not yet a member of the certification center', () => {

          it('should create a certification center membership and update organizationRole', async () => {
          // given
            const membershipId = 1;
            const domainTransaction = Symbol('a domain transaction');
            const externalId = 'externalId';
            const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
            const givenMembership = new Membership({ id: membershipId, organizationRole: Membership.roles.ADMIN });
            const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
            const existingCertificationCenter = domainBuilder.buildCertificationCenter({ externalId });
            const existingMembership = domainBuilder.buildMembership({
              id: membershipId,
              organizationRole: Membership.roles.MEMBER,
              organization: organization,
              user: userWhoseOrganizationRoleIsToUpdate,
            });

            membershipRepository.get.withArgs(membershipId).resolves(existingMembership);
            certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(existingCertificationCenter);
            certificationCenterMembershipRepository.isMemberOfCertificationCenter
              .withArgs(userWhoseOrganizationRoleIsToUpdate.id, existingCertificationCenter.id)
              .resolves(false);
            DomainTransaction.execute = (lambda) => { return lambda(domainTransaction); };
            const membershipUpdated = Symbol('updated membership with related organization and user');
            membershipRepository.updateById.withArgs({ id: membershipId, membership: givenMembership }, domainTransaction).resolves(membershipUpdated);

            // when
            const result = await updateMembership({
              membership: givenMembership,
              domainTransaction,
              membershipRepository,
              certificationCenterRepository,
              certificationCenterMembershipRepository,
            });

            // then
            expect(result).to.deep.equal(membershipUpdated);
            expect(certificationCenterMembershipRepository.save).to.have.been.calledWith(userWhoseOrganizationRoleIsToUpdate.id, existingCertificationCenter.id, domainTransaction);
          });
        });
      });

      context('when the membership\'s organization has no certification center', () => {

        it('should not create a certification center membership', async () => {
        // given
          const membershipId = 1;
          const externalId = 'externalId';
          const givenMembership = new Membership({ id: membershipId, organizationRole: Membership.roles.ADMIN });
          const organization = domainBuilder.buildOrganization({ externalId, type: 'SCO' });
          const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
          const existingMembership = domainBuilder.buildMembership({
            id: membershipId,
            organization: organization,
            user: userWhoseOrganizationRoleIsToUpdate,
          });

          membershipRepository.get.withArgs(membershipId).resolves(existingMembership);
          certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(null);

          // when
          await updateMembership({
            membership: givenMembership,
            membershipRepository,
            certificationCenterRepository,
            certificationCenterMembershipRepository,
          });

          // then
          expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
        });

        it('should update the membership', async () => {
        // given
          const organization = domainBuilder.buildOrganization({ type: 'SUP' });
          const membershipId = 100;
          const organizationRole = Membership.roles.ADMIN;
          const givenMembership = new Membership({ id: membershipId, organizationRole });
          const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
          const existingMembership = domainBuilder.buildMembership({
            id: membershipId,
            organization: organization,
            user: userWhoseOrganizationRoleIsToUpdate,
          });
          membershipRepository.get.withArgs(membershipId).resolves(existingMembership);
          certificationCenterRepository.findByExternalId.resolves(null);
          const membershipWithRelatedUserAndOrganization = Symbol('a membership with related informations');
          membershipRepository.updateById
            .withArgs({ id: membershipId, membership: givenMembership })
            .resolves(membershipWithRelatedUserAndOrganization);

          // when
          const result = await updateMembership({
            membership: givenMembership,
            membershipRepository,
            certificationCenterRepository,
            certificationCenterMembershipRepository,
          });

          // then
          expect(result).to.equal(membershipWithRelatedUserAndOrganization);
        });
      });
    });

    context('when the organization is not SCO', () => {

      it('should not create a certification center membership', async () => {
        // given
        const membershipId = 1;
        const givenMembership = new Membership({ id: membershipId, organizationRole: Membership.roles.ADMIN });
        const externalId = 'externalId';
        const organization = domainBuilder.buildOrganization({ type: 'SUP', externalId });
        const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
        const existingCertificationCenter = domainBuilder.buildCertificationCenter({ externalId });
        const existingMembership = domainBuilder.buildMembership({
          id: membershipId,
          organizationRole: Membership.roles.MEMBER,
          organization,
          user: userWhoseOrganizationRoleIsToUpdate,
        });

        membershipRepository.get.withArgs(membershipId).resolves(existingMembership);
        certificationCenterRepository.findByExternalId.withArgs({ externalId }).resolves(existingCertificationCenter);

        // when
        await updateMembership({
          membership: givenMembership,
          membershipRepository,
          certificationCenterRepository,
          certificationCenterMembershipRepository,
        });

        // then
        expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
      });
    });

  });

  context('when the organizationRole to update is set to member', () => {

    it('should not create a certification center membership', async () => {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO' });
      const membershipId = 1;
      const givenMembership = new Membership({ id: membershipId, organizationRole: Membership.roles.MEMBER });
      const userWhoseOrganizationRoleIsToUpdate = domainBuilder.buildUser();
      const existingMembership = domainBuilder.buildMembership({
        id: membershipId,
        organization: organization,
        organizationRole: Membership.roles.ADMIN,
        user: userWhoseOrganizationRoleIsToUpdate,
      });
      membershipRepository.get.withArgs(membershipId).resolves(existingMembership);

      // when
      await updateMembership({
        membership: givenMembership,
        membershipRepository,
        certificationCenterRepository,
        certificationCenterMembershipRepository,
      });

      // then
      expect(certificationCenterMembershipRepository.save).to.not.have.been.called;
    });

    it('should update the membership', async () => {
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
      certificationCenterRepository.findByExternalId.resolves(null);
      membershipRepository.updateById.withArgs({ id: membershipId, membership: givenMembership }).resolves(membershipWithRelatedUserAndOrganization);

      // when
      const result = await updateMembership({
        membership: givenMembership,
        membershipRepository,
        certificationCenterRepository,
        certificationCenterMembershipRepository,
      });

      // then
      expect(result).to.equal(membershipWithRelatedUserAndOrganization);
    });

  });

});

