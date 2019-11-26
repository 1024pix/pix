const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const _ = require('lodash');

const membershipRepository = require('../../../../lib/infrastructure/repositories/membership-repository');
const organizationInvitationRepository = require('../../../../lib/infrastructure/repositories/organization-invitation-repository');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');

const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const { AlreadyExistingMembershipError, AlreadyExistingOrganizationInvitationError } = require('../../../../lib/domain/errors');

const { createOrganizationInvitation } = require('../../../../lib/domain/services/organization-invitation-service');

describe('Integration | Service | Organization-Invitation Service', () => {

  describe('#createOrganizationInvitation', () => {

    let organizationId;
    let user;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      user = databaseBuilder.factory.buildUser();

      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('organization-invitations').delete();
    });

    it('should create a new organization-invitation with organizationId, email and status', async () => {
      // given
      const expectedOrganizationInvitation = {
        organizationId,
        email: user.email,
        status: OrganizationInvitation.StatusType.PENDING,
      };

      // when
      const result = await createOrganizationInvitation({
        membershipRepository, organizationRepository, organizationInvitationRepository,
        organizationId,
        email: user.email
      });

      // then
      expect(result).to.be.instanceOf(OrganizationInvitation);
      expect(_.omit(result, ['id', 'code', 'organizationName', 'createdAt', 'updatedAt'])).to.deep.equal(expectedOrganizationInvitation);
    });

    it('should throw AlreadyExistingMembershipError when membership already exist', async () => {
      // given
      databaseBuilder.factory.buildMembership({ organizationId, userId: user.id });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(createOrganizationInvitation)({
        membershipRepository, organizationRepository, organizationInvitationRepository,
        organizationId,
        email: user.email
      });

      // then
      expect(error).to.be.instanceOf(AlreadyExistingMembershipError);
    });

    it('should throw AlreadyExistingOrganizationInvitationError when organization-invitation already exist with status accepted', async () => {
      // given
      databaseBuilder.factory.buildOrganizationInvitation({
        organizationId,
        email: user.email,
        status: OrganizationInvitation.StatusType.ACCEPTED
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(createOrganizationInvitation)({
        membershipRepository, organizationRepository, organizationInvitationRepository,
        organizationId,
        email: user.email
      });

      // then
      expect(error).to.be.instanceOf(AlreadyExistingOrganizationInvitationError);
    });
  });

});
