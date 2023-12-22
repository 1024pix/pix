import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper.js';
import { acceptOrganizationInvitation } from '../../../../lib/domain/usecases/accept-organization-invitation.js';
import { OrganizationInvitedUser } from '../../../../lib/domain/models/OrganizationInvitedUser.js';
import { AlreadyExistingMembershipError } from '../../../../lib/domain/errors.js';

describe('Unit | UseCase | accept-organization-invitation', function () {
  let organizationInvitedUserRepository;
  let organizationInvitationRepository;
  let userRepository;

  beforeEach(function () {
    organizationInvitedUserRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
    organizationInvitationRepository = {
      markAsAccepted: sinon.stub(),
    };
    userRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
  });

  context('when the user’s membership already exist', function () {
    it('should mark the invitation as accepted', async function () {
      // given
      const code = '123AZE';
      const email = 'user@example.net';
      const organization = domainBuilder.buildOrganization();
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({
        organizationId: organization.id,
        code,
      });
      const user = domainBuilder.buildUser();
      const membership = domainBuilder.buildMembership({ user, organization, organizationRole: 'ADMIN' });

      const organizationInvitedUser = new OrganizationInvitedUser({
        userId: user.id,
        invitation: { code, id: organizationInvitation.id },
        currentRole: membership.organizationRole,
        status: organizationInvitation.status,
      });
      organizationInvitedUserRepository.get
        .withArgs({ organizationInvitationId: organizationInvitation.id, email })
        .resolves(organizationInvitedUser);

      // when
      const error = await catchErr(acceptOrganizationInvitation)({
        organizationInvitationId: organizationInvitation.id,
        code,
        email,
        organizationInvitationRepository,
        organizationInvitedUserRepository,
      });

      // then
      expect(organizationInvitationRepository.markAsAccepted).to.have.been.calledWithExactly(organizationInvitation.id);
      expect(error).to.be.instanceOf(AlreadyExistingMembershipError);
    });
  });

  context('when the user’s membership does not already exist', function () {
    context('when the user does not have a locale cookie', function () {
      it('returns the membership id and role and does not update the user’s locale', async function () {
        // given
        const { organizationInvitationId, organizationInvitedUser, organization, code, email, user } = createContext({
          organizationInvitedUserRepository,
          userRepository,
          userLocale: null,
        });

        const membership = domainBuilder.buildMembership({ user, organization, organizationRole: 'MEMBER' });
        organizationInvitedUser.currentMembershipId = membership.id;
        organizationInvitedUser.currentRole = membership.organizationRole;

        // when
        const result = await acceptOrganizationInvitation({
          organizationInvitationId,
          code,
          email,
          localeFromCookie: undefined,
          organizationInvitationRepository,
          organizationInvitedUserRepository,
          userRepository,
        });

        // then
        expect(organizationInvitedUserRepository.save).to.have.been.calledWithExactly({ organizationInvitedUser });
        expect(result).to.deep.equal({
          id: organizationInvitedUser.currentMembershipId,
          isAdmin: false,
        });
        expect(userRepository.update).to.not.have.been.called;
      });
    });

    context('when the user has a locale cookie', function () {
      context('when the user already has a locale', function () {
        it('must not update the user’s locale', async function () {
          // given
          const { organizationInvitationId, code, email, localeFromCookie } = createContext({
            organizationInvitedUserRepository,
            userRepository,
            userLocale: 'fr-FR',
          });

          // when
          await acceptOrganizationInvitation({
            organizationInvitationId,
            code,
            email,
            localeFromCookie,
            organizationInvitationRepository,
            organizationInvitedUserRepository,
            userRepository,
          });

          // then
          expect(userRepository.update).to.not.have.been.called;
        });
      });

      context('when the user does not already have a locale', function () {
        it('updates the user’s locale', async function () {
          // given
          const { organizationInvitationId, code, email, localeFromCookie, user } = createContext({
            organizationInvitedUserRepository,
            userRepository,
            userLocale: null,
          });

          // when
          await acceptOrganizationInvitation({
            organizationInvitationId,
            code,
            email,
            localeFromCookie,
            organizationInvitationRepository,
            organizationInvitedUserRepository,
            userRepository,
          });

          // then
          expect(userRepository.update).to.have.have.been.calledWithExactly({ id: user.id, locale: 'fr-BE' });
        });
      });
    });
  });
});

function createContext({ organizationInvitedUserRepository, userRepository, userLocale }) {
  const code = '123AZE';
  const email = 'user@example.net';
  const localeFromCookie = 'fr-BE';
  const organization = domainBuilder.buildOrganization();
  const organizationInvitationId = domainBuilder.buildOrganizationInvitation({
    organizationId: organization.id,
    code,
  }).id;
  const user = domainBuilder.buildUser({ locale: userLocale });

  const organizationInvitedUser = new OrganizationInvitedUser({
    userId: user.id,
    invitation: { code, id: organizationInvitationId },
  });
  organizationInvitedUserRepository.get.withArgs({ organizationInvitationId, email }).resolves(organizationInvitedUser);

  sinon.stub(organizationInvitedUser, 'acceptInvitation').resolves();

  userRepository.get.withArgs(user.id).resolves(user);
  return { organizationInvitationId, organizationInvitedUser, organization, code, email, localeFromCookie, user };
}
