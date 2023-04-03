const up = async function (knex) {
  await knex('certification-candidates').where({ birthPostalCode: 'NULL' }).update({ birthPostalCode: null });
  await knex('certification-candidates').where({ birthINSEECode: 'NULL' }).update({ birthINSEECode: null });
};
// eslint-disable-next-line no-empty-function
const down = function () {};
export { up, down };
