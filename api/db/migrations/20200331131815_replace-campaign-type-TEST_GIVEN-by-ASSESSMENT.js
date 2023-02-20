const TABLE_NAME = 'campaigns';

export const up = function (knex) {
  return knex(TABLE_NAME).where('type', '=', 'TEST_GIVEN').update({
    type: 'ASSESSMENT',
  });
};

export const down = function (knex) {
  return knex(TABLE_NAME).where('type', '=', 'ASSESSMENT').update({
    type: 'TEST_GIVEN',
  });
};
