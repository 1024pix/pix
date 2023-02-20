import OrganizationInvitedUser from '../../../../lib/domain/models/OrganizationInvitedUser';
import { expect, catchErr, domainBuilder } from '../../../test-helper';

import {
  NotFoundError,
  AlreadyExistingMembershipError,
  AlreadyAcceptedOrCancelledInvitationError,
} from '../../../../lib/domain/errors';

describe('Unit | Domain | Models | OrganizationInvitedUser', function () {
  describe('#acceptInvitation', function () {
    describe('Error cases', function () {
      describe('When organization code is invalid', function () {
        it('should throw an error', async function () {
          // given
          const code = '1234AZE';
          const invitedUser = new OrganizationInvitedUser({
            userId: domainBuilder.buildUser().id,
            invitation: {
              code: '5678BFR',
            },
            currentRole: null,
            organizationHasMemberships: 2,
            currentMembershipId: null,
            status: 'pending',
          });

          // when
          const error = await catchErr(invitedUser.acceptInvitation, invitedUser)({ code });

          // then
          expect(error).to.be.an.instanceof(NotFoundError);
        });
      });
      describe('When membership already exist and invitation does not has role', function () {
        it('should throw an error', async function () {
          // given
          const code = '1234AZE';
          const invitedUser = new OrganizationInvitedUser({
            userId: domainBuilder.buildUser().id,
            invitation: {
              code: '1234AZE',
              role: null,
            },
            currentRole: 'MEMBER',
            organizationHasMemberships: 2,
            currentMembershipId: domainBuilder.buildMembership().id,
            status: 'pending',
          });

          // when
          const error = await catchErr(invitedUser.acceptInvitation, invitedUser)({ code });

          // then
          expect(error).to.be.an.instanceof(AlreadyExistingMembershipError);
        });
      });
      describe('When invitation is accepted or cancelled', function () {
        it('should throw an error', async function () {
          // given
          const code = '1234AZE';
          const invitedUser = new OrganizationInvitedUser({
            userId: domainBuilder.buildUser().id,
            invitation: {
              code: '1234AZE',
              role: null,
            },
            currentRole: 'MEMBER',
            organizationHasMemberships: 2,
            currentMembershipId: domainBuilder.buildMembership().id,
            status: 'accepted',
          });

          // when
          const error = await catchErr(invitedUser.acceptInvitation, invitedUser)({ code });

          // then
          expect(error).to.be.an.instanceof(AlreadyAcceptedOrCancelledInvitationError);
          expect(error.message).to.equal("L'invitation a déjà été acceptée ou annulée.");
        });
      });
    });
    describe('Success cases', function () {
      describe('When invitation has role', function () {
        it('should become member current role', async function () {
          // given
          const code = '1234AZE';
          const invitedUser = new OrganizationInvitedUser({
            userId: domainBuilder.buildUser().id,
            invitation: {
              code,
              role: 'ADMIN',
            },
            currentRole: null,
            organizationHasMemberships: 2,
            currentMembershipId: null,
            status: 'pending',
          });

          // when
          invitedUser.acceptInvitation({ code });

          // then
          expect(invitedUser.currentRole).to.equal('ADMIN');
        });
      });
      describe('When invitation does not has role', function () {
        describe('When organization has memberships', function () {
          it('should fill the current role with "MEMBER"', async function () {
            // given
            const code = '1234AZE';
            const invitedUser = new OrganizationInvitedUser({
              userId: domainBuilder.buildUser().id,
              invitation: {
                code,
                role: null,
              },
              currentRole: null,
              organizationHasMemberships: 2,
              currentMembershipId: null,
              status: 'pending',
            });

            // when
            invitedUser.acceptInvitation({ code });

            // then
            expect(invitedUser.currentRole).to.equal('MEMBER');
          });
        });
        describe('When organization has not memberships', function () {
          it('should fill the current role with "ADMIN"', async function () {
            // given
            const code = '1234AZE';
            const invitedUser = new OrganizationInvitedUser({
              userId: domainBuilder.buildUser().id,
              invitation: {
                code,
                role: null,
              },
              currentRole: null,
              organizationHasMemberships: 0,
              currentMembershipId: null,
              status: 'pending',
            });

            // when
            invitedUser.acceptInvitation({ code });

            // then
            expect(invitedUser.currentRole).to.equal('ADMIN');
          });
        });
      });
      it('should mark invitation as accepted', async function () {
        // given
        const code = '1234AZE';
        const invitedUser = new OrganizationInvitedUser({
          userId: domainBuilder.buildUser().id,
          invitation: {
            code,
            role: null,
          },
          currentRole: null,
          organizationHasMemberships: 2,
          currentMembershipId: null,
          status: 'pending',
        });

        // when
        invitedUser.acceptInvitation({ code });

        // then
        expect(invitedUser.status).to.equal('accepted');
      });
    });
  });

  describe('isPending', function () {
    it('should return true if current membership id exist', function () {
      // given
      const invitedUser = new OrganizationInvitedUser({
        userId: domainBuilder.buildUser().id,
        invitation: {
          code: 'ZERRTTYG',
          role: null,
        },
        currentRole: 'ADMIN',
        organizationHasMemberships: 2,
        currentMembershipId: domainBuilder.buildMembership().id,
        status: 'pending',
      });

      // when
      const result = invitedUser.isAlreadyMemberOfOrganization;

      // /then
      expect(result).to.be.true;
    });

    it('should return false if current membership id does not exist', function () {
      // given
      const invitedUser = new OrganizationInvitedUser({
        userId: domainBuilder.buildUser().id,
        invitation: {
          code: 'ZERRTTYG',
          role: null,
        },
        currentRole: null,
        organizationHasMemberships: 2,
        currentMembershipId: null,
        status: 'pending',
      });

      // when
      const result = invitedUser.isAlreadyMemberOfOrganization;

      // /then
      expect(result).to.be.false;
    });
  });
});
