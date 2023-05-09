const TABLE_NAME = 'sessions';
const OLD_STATUS = 'started';
const NEW_STATUS = 'created';

const up = function (knex) {
  return knex(TABLE_NAME).where('status', '=', OLD_STATUS).update({ status: NEW_STATUS });
};

const down = function (knex) {
  return knex(TABLE_NAME).where('status', '=', NEW_STATUS).update({ status: OLD_STATUS });
};

export { up, down };
