const { knex } = require('../bookshelf');
const AdminMember = require('../../domain/read-models/AdminMember');
const { AdminMemberRoleUpdateError } = require('../../domain/errors');

module.exports = {
  findAll: async function () {
    const members = await knex
      .select('pix-admin-roles.id', 'users.id as userId', 'firstName', 'lastName', 'email', 'role')
      .from('pix-admin-roles')
      .join('users', 'users.id', 'pix-admin-roles.userId')
      .where('pix-admin-roles.disabledAt', null)
      .orderBy(['firstName', 'lastName']);
    return members.map((member) => new AdminMember(member));
  },

  async update({ id, attributesToUpdate }) {
    const now = new Date();
    const [updatedAdminMember] = await knex
      .from('pix-admin-roles')
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
};
