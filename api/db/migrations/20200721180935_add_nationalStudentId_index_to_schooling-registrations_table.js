exports.up = (knex) => {
  return knex.raw('CREATE INDEX "schooling-registrations_nationalstudentid_index" ON "schooling-registrations" ("nationalStudentId");');
};

exports.down = (knex) => {
  return knex.raw('DROP INDEX "schooling-registrations_nationalstudentid_index";');
};
