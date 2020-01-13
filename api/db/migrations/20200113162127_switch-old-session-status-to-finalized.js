const TABLE_NAME = 'sessions';

exports.up = function(knex) {
    return knex(TABLE_NAME)
      .where('date', '<', knex.fn.now())
      .update({ status: 'finalized' });
};

exports.down = function(knex) {
    return knex(TABLE_NAME)
      .where('date', '<', knex.fn.now())
      .update({ status: 'started' });
};
