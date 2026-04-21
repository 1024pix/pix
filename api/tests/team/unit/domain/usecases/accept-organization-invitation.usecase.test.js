import sinon from 'sinon';

import { AlreadyExistingMembershipError } from '../../../../../src/shared/domain/errors.js';
import { OrganizationInvitedUser } from '../../../../../src/team/domain/models/OrganizationInvitedUser.js';
import { acceptOrganizationInvitation } from '../../../../../src/team/domain/usecases/accept-organization-invitation.usecase.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Unit | Domain | UseCases | accept-organization-invitation', function () {
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
        .withArgs({ organizationInvitationId: organizationInvitation.id, userId: user.id })
        .resolves(organizationInvitedUser);

      // when
      const error = await catchErr(acceptOrganizationInvitation)({
        organizationInvitationId: organizationInvitation.id,
        code,
        userId: user.id,
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
        const { organizationInvitationId, organizationInvitedUser, organization, code, user } = createContext({
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
          userId: user.id,
          locale: undefined,
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
          const { organizationInvitationId, code, user, locale } = createContext({
            organizationInvitedUserRepository,
            userRepository,
            userLocale: 'fr-BE',
          });

          // when
          await acceptOrganizationInvitation({
            organizationInvitationId,
            code,
            userId: user.id,
            locale,
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
          const { organizationInvitationId, code, locale, user } = createContext({
            organizationInvitedUserRepository,
            userRepository,
            userLocale: null,
          });

          // when
          await acceptOrganizationInvitation({
            organizationInvitationId,
            code,
            userId: user.id,
            locale,
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
  const locale = 'fr-BE';
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
  organizationInvitedUserRepository.get
    .withArgs({ organizationInvitationId, userId: user.id })
    .resolves(organizationInvitedUser);

  sinon.stub(organizationInvitedUser, 'acceptInvitation').resolves();

  userRepository.get.withArgs(user.id).resolves(user);
  return { organizationInvitationId, organizationInvitedUser, organization, code, locale, user };
}
