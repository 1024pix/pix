export const up = async function (knex) {
  await knex('certification-candidates').where({ birthPostalCode: 'NULL' }).update({ birthPostalCode: null });
  await knex('certification-candidates').where({ birthINSEECode: 'NULL' }).update({ birthINSEECode: null });
};

export const down = function () {
  // do nothing.
};
