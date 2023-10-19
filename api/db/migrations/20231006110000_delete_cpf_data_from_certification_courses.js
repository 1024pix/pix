const up = async function (knex) {
  return knex.schema.table('certification-courses', function (table) {
    table.dropColumn('cpfFilename');
    table.dropColumn('cpfImportStatus');
  });
};

const down = async function () {
  return;
};

export { up, down };
