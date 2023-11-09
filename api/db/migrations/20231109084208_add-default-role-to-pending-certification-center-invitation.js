const TABLE_NAME = 'certification-center-invitations';

const up = async function (knex) {
  await knex(TABLE_NAME).whereNull('role').andWhere({ status: 'pending' }).update({ role: 'MEMBER' });
};

const down = async function () {
  // do nothing
};

export { up, down };
