const { knex } = require('../../../db/knex-database-connection');
const OrganizationInvitedUser = require('../../domain/models/OrganizationInvitedUser');
const { NotFoundError } = require('../../domain/errors');

module.exports = {
  async get({ organizationInvitationId, email }) {
    const invitation = await knex('organization-invitations')
      .select('id', 'organizationId', 'code', 'role', 'status')
      .where({ id: organizationInvitationId })
      .first();
    if (!invitation) {
      throw new NotFoundError(`Not found organization-invitation for ID ${organizationInvitationId}`);
    }

    const user = await knex('users').select('id').where({ email }).first();
    if (!user) {
      throw new NotFoundError(`Not found user for email ${email}`);
    }

    const memberships = await knex('memberships')
      .select('id', 'userId', 'organizationRole')
      .where({
        organizationId: invitation.organizationId,
        disabledAt: null,
      })
      .orderBy('id', 'ASC');

    const existingMembership = memberships.find((membership) => membership.userId === user.id);

    return new OrganizationInvitedUser({
      userId: user.id,
      invitation,
      currentMembershipId: existingMembership?.id,
      currentRole: existingMembership?.organizationRole,
      organizationHasMemberships: memberships.length,
      status: invitation.status,
    });
  },

  async save({ organizationInvitedUser }) {
    const date = new Date();

    if (organizationInvitedUser.isAlreadyMemberOfOrganization) {
      await knex('memberships')
        .update({
          organizationRole: organizationInvitedUser.currentRole,
          updatedAt: date,
        })
        .where({ id: organizationInvitedUser.currentMembershipId });
    } else {
      const [membershipId] = await knex('memberships').returning('id').insert({
        organizationRole: organizationInvitedUser.currentRole,
        organizationId: organizationInvitedUser.invitation.organizationId,
        userId: organizationInvitedUser.userId,
      });

      organizationInvitedUser.currentMembershipId = membershipId;
    }

    await knex('user-orga-settings')
      .insert({
        userId: organizationInvitedUser.userId,
        currentOrganizationId: organizationInvitedUser.invitation.organizationId,
        updatedAt: new Date(),
      })
      .onConflict('userId')
      .merge();

    await knex('organization-invitations')
      .update({ status: organizationInvitedUser.status, updatedAt: date })
      .where({ id: organizationInvitedUser.invitation.id });
  },
};
