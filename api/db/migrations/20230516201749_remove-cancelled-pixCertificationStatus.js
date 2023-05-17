exports.up = function (knex) {
  return knex('certification-courses').update({ pixCertificationStatus: null }).where({ isCancelled: true });
};

exports.down = function () {
  // no need for rollback
};
