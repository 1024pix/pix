const { knex } = require('../bookshelf');
const AdminMember = require('../../domain/models/AdminMember');
const { AdminMemberRoleUpdateError, AdminMemberError } = require('../../domain/errors');

const TABLE_NAME = 'pix-admin-roles';

module.exports = {
  findAll: async function () {
    const members = await knex
      .select(`${TABLE_NAME}.id`, 'users.id as userId', 'firstName', 'lastName', 'email', 'role')
      .from(TABLE_NAME)
      .where({ disabledAt: null })
      .join('users', 'users.id', `${TABLE_NAME}.userId`)
      .orderBy(['firstName', 'lastName']);

    return members.map((member) => new AdminMember(member));
  },

  get: async function ({ userId }) {
    const member = await knex
      .select(`${TABLE_NAME}.id`, 'users.id as userId', 'firstName', 'lastName', 'email', 'role', 'disabledAt')
      .from(TABLE_NAME)
      .where({ userId })
      .join('users', 'users.id', `${TABLE_NAME}.userId`)
      .first();

    return member ? new AdminMember(member) : undefined;
  },

  async update({ id, attributesToUpdate }) {
    const now = new Date();
    const [updatedAdminMember] = await knex
      .from(TABLE_NAME)
      .where({ id })
      .update({ ...attributesToUpdate, updatedAt: now })
      .returning('*');

    if (!updatedAdminMember) {
      throw new AdminMemberRoleUpdateError();
    }

    return new AdminMember(updatedAdminMember);
  },

  async save(pixAdminRole) {
    const [savedAdminMember] = await knex(TABLE_NAME).insert(pixAdminRole).returning('*');
    return new AdminMember(savedAdminMember);
  },

  async deactivate({ id }) {
    const now = new Date();
    const [deactivateddAdminMember] = await knex
      .from('pix-admin-roles')
      .where({ id })
      .whereRaw('"disabledAt" IS NULL')
      .update({ disabledAt: now, updatedAt: now })
      .returning('*');

    if (!deactivateddAdminMember) {
      throw new AdminMemberError(
        'A problem occured while trying to deactivate an admin member',
        'DEACTIVATE_ADMIN_MEMBER_ERROR'
      );
    }
  },
};
