import { knex } from '../../../../db/knex-database-connection.js';
import { InvitationNotFoundError, UserNotFoundError } from '../../../shared/domain/errors.js';
import { OrganizationInvitedUser } from '../../domain/models/OrganizationInvitedUser.js';

const get = async function ({ organizationInvitationId, userId }) {
  const invitation = await knex('organization-invitations')
    .select('id', 'organizationId', 'code', 'role', 'status')
    .where({ id: organizationInvitationId })
    .first();
  if (!invitation) throw new InvitationNotFoundError();

  const user = await knex('users').select('id').where({ id: userId }).first();
  if (!user) {
    throw new UserNotFoundError();
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
};

const save = async function ({ organizationInvitedUser }) {
  const date = new Date();

  if (organizationInvitedUser.isAlreadyMemberOfOrganization) {
    await knex('memberships')
      .update({
        organizationRole: organizationInvitedUser.currentRole,
        updatedAt: date,
      })
      .where({ id: organizationInvitedUser.currentMembershipId });
  } else {
    const [{ id: membershipId }] = await knex('memberships')
      .insert({
        organizationRole: organizationInvitedUser.currentRole,
        organizationId: organizationInvitedUser.invitation.organizationId,
        userId: organizationInvitedUser.userId,
      })
      .returning('id')
      .onConflict(['organizationId', 'userId'])
      .ignore();

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
};

const organizationInvitedUserRepository = { get, save };
export { organizationInvitedUserRepository };
