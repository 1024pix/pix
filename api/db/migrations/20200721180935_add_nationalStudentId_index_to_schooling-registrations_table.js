exports.up = (knex) => {
  // cspell:disable-next
  return knex.raw('CREATE INDEX "schooling-registrations_nationalstudentid_index" ON "schooling-registrations" ("nationalStudentId");');
};

exports.down = (knex) => {
  // cspell:disable-next
  return knex.raw('DROP INDEX "schooling-registrations_nationalstudentid_index";');
};
