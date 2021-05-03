exports.up = function(knex) {
  return knex.raw('UPDATE "certification-candidates"' +
    'SET "firstName" = TRIM("firstName"), "lastName" = TRIM("lastName")' +
    'WHERE "firstName" LIKE \'% \' OR "firstName" LIKE \' %\'' +
    ' OR "lastName" LIKE \'% \' OR "lastName" LIKE \' %\'');
};

exports.down = function(_) {

};
