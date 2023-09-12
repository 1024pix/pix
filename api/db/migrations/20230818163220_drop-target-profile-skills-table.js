const up = function (knex) {
  return knex.schema.dropTable('target-profiles_skills');
};

const down = async function () {
  // No down script will be written since all data is lost anyway,
  // and at this point in GitHub table is not read anymore by the code
};

export { up, down };
