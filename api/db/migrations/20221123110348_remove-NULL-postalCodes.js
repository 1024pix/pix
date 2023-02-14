exports.up = async function (knex) {
  await knex('certification-candidates').where({ birthPostalCode: 'NULL' }).update({ birthPostalCode: null });
  await knex('certification-candidates').where({ birthINSEECode: 'NULL' }).update({ birthINSEECode: null });
};

exports.down = function () {
  // do nothing.
};
