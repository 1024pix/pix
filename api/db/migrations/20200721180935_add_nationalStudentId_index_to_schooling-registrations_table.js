export const up = (knex) => {
  return knex.raw(
    'CREATE INDEX "schooling-registrations_nationalstudentid_index" ON "schooling-registrations" ("nationalStudentId");'
  );
};

export const down = (knex) => {
  return knex.raw('DROP INDEX "schooling-registrations_nationalstudentid_index";');
};
