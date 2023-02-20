const TABLE_NAME = 'sessions';
const OLD_STATUS = 'started';
const NEW_STATUS = 'created';

export const up = function (knex) {
  return knex(TABLE_NAME).where('status', '=', OLD_STATUS).update({ status: NEW_STATUS });
};

export const down = function (knex) {
  return knex(TABLE_NAME).where('status', '=', NEW_STATUS).update({ status: OLD_STATUS });
};
