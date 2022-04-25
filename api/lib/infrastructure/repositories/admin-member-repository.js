const { knex } = require('../bookshelf');
const AdminMember = require('../../domain/read-models/AdminMember');

module.exports = {
  findAll: async function () {
    const members = await knex
      .select('users.id', 'firstName', 'lastName', 'email', 'role')
      .from('pix-admin-roles')
      .join('users', 'users.id', 'pix-admin-roles.userId')
      .where('pix-admin-roles.disabledAt', null)
      .orderBy(['firstName', 'lastName']);
    return members.map((member) => new AdminMember(member));
  },
};
