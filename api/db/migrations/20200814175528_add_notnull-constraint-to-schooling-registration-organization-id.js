// Switching to raw SQL, because knex can't NOT NULL constraint on existing column
// exports.up = function(knex) {
//   return knex.schema
//     .alterTable(TABLE_NAME, (table) => {
//       table.string(COLUMN_NAME).notNullable().alter();
//     });
// };
// migration failed with error: alter table "schooling-registrations" alter column "organizationId" type varchar(255) using ("organizationId"::varchar(255)) -
// foreign key constraint "students_organizationid_foreign" cannot be implemented

exports.up = function (knex) {
  return knex.raw('ALTER TABLE "schooling-registrations" ALTER COLUMN "organizationId" SET NOT NULL;');
};

exports.down = function (knex) {
  return knex.raw('ALTER TABLE "schooling-registrations" ALTER COLUMN "organizationId" DROP NOT NULL;');
};
