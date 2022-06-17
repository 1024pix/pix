const { knex } = require('../bookshelf');
const AdminMember = require('../../domain/models/AdminMember');
const { AdminMemberRoleUpdateError } = require('../../domain/errors');

const TABLE_NAME = 'pix-admin-roles';

module.exports = {
  findAll: async function () {
    const members = await knex
      .select(`${TABLE_NAME}.id`, 'users.id as userId', 'firstName', 'lastName', 'email', 'role')
      .from(TABLE_NAME)
      .join('users', 'users.id', `${TABLE_NAME}.userId`)
      .orderBy(['firstName', 'lastName']);
    return members.map((member) => new AdminMember(member));
  },

  get: async function ({ userId }) {
    const member = await knex
      .select(`${TABLE_NAME}.id`, 'users.id as userId', 'firstName', 'lastName', 'email', 'role')
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

    return new AdminMember({
      id: updatedAdminMember.id,
      role: updatedAdminMember.role,
    });
  },

  async save(pixAdminRole) {
    const [savedAdminMember] = await knex(TABLE_NAME).insert(pixAdminRole).returning('*');
    return new AdminMember(savedAdminMember);
  },
};
