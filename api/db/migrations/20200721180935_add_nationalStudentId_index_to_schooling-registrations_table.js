const up = function (knex) {
  return knex.raw(
    'CREATE INDEX "schooling-registrations_nationalstudentid_index" ON "schooling-registrations" ("nationalStudentId");'
  );
};

const down = function (knex) {
  return knex.raw('DROP INDEX "schooling-registrations_nationalstudentid_index";');
};

export { up, down };
