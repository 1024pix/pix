const TABLE_NAME = 'certification-candidates';

exports.up = async function (knex) {
  await knex.schema.table(TABLE_NAME, (table) => {
    table.text('billingMode').defaultsTo(null);
    table.text('prepaymentCode').defaultsTo(null);
  });

  await knex.raw(
    'ALTER TABLE "certification-candidates" ADD CONSTRAINT "certification-candidates_billingMode_check" CHECK ( "billingMode" IN ( \'FREE\', \'PAID\', \'PREPAID\'))'
  );
};

exports.down = function (knex) {
  return knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn('billingMode');
    table.dropColumn('prepaymentCode');
  });
};
