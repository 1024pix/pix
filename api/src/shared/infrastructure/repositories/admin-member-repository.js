import { knex } from '../../../../db/knex-database-connection.js';
import { AdminMember } from '../../../../lib/domain/models/AdminMember.js';
import { AdminMemberError } from '../../../../lib/domain/errors.js';

const TABLE_NAME = 'pix-admin-roles';

const findAll = async function () {
  const members = await knex
    .select(`${TABLE_NAME}.id`, 'users.id as userId', 'firstName', 'lastName', 'email', 'role')
    .from(TABLE_NAME)
    .where({ disabledAt: null })
    .join('users', 'users.id', `${TABLE_NAME}.userId`)
    .orderBy(['firstName', 'lastName']);

  return members.map((member) => new AdminMember(member));
};

const getById = async function (id) {
  const adminMember = await knex
    .select(`${TABLE_NAME}.id`, 'users.id as userId', 'firstName', 'lastName', 'email', 'role', 'disabledAt')
    .from(TABLE_NAME)
    .where({ 'pix-admin-roles.id': id })
    .join('users', 'users.id', `${TABLE_NAME}.userId`)
    .first();

  return adminMember ? new AdminMember(adminMember) : undefined;
};

const get = async function ({ userId }) {
  const adminMember = await knex
    .select(`${TABLE_NAME}.id`, 'users.id as userId', 'firstName', 'lastName', 'email', 'role', 'disabledAt')
    .from(TABLE_NAME)
    .where({ userId })
    .join('users', 'users.id', `${TABLE_NAME}.userId`)
    .first();

  return adminMember ? new AdminMember(adminMember) : undefined;
};

const update = async function ({ id, attributesToUpdate }) {
  const now = new Date();
  const [updatedAdminMember] = await knex
    .from(TABLE_NAME)
    .where({ id })
    .update({ ...attributesToUpdate, updatedAt: now })
    .returning('*');

  if (!updatedAdminMember) {
    throw new AdminMemberError(
      'A problem occurred while trying to update an admin member role',
      'UPDATE_ADMIN_MEMBER_ERROR',
    );
  }

  return new AdminMember(updatedAdminMember);
};

const save = async function (pixAdminRole) {
  const [savedAdminMember] = await knex(TABLE_NAME).insert(pixAdminRole).returning('*');
  return new AdminMember(savedAdminMember);
};

const deactivate = async function ({ id }) {
  const now = new Date();
  const [deactivateddAdminMember] = await knex
    .from('pix-admin-roles')
    .where({ id })
    .whereRaw('"disabledAt" IS NULL')
    .update({ disabledAt: now, updatedAt: now })
    .returning('*');

  if (!deactivateddAdminMember) {
    throw new AdminMemberError(
      'A problem occurred while trying to deactivate an admin member',
      'DEACTIVATE_ADMIN_MEMBER_ERROR',
    );
  }
};

export { findAll, getById, get, update, save, deactivate };
