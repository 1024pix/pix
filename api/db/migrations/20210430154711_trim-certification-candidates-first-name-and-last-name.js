export const up = function (knex) {
  // eslint-disable-next-line knex/avoid-injections
  return knex.raw(
    'UPDATE "certification-candidates"' +
      'SET "firstName" = TRIM("firstName"), "lastName" = TRIM("lastName")' +
      'WHERE "firstName" LIKE \'% \' OR "firstName" LIKE \' %\'' +
      ' OR "lastName" LIKE \'% \' OR "lastName" LIKE \' %\''
  );
};

export const down = function () {
  return;
};
