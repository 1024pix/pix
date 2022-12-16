const TABLE_NAME = 'certification-courses';

exports.up = function (knex) {
  return knex(TABLE_NAME).where('createdAt', '>', '2021-01-01').andWhere('isV2Certification', false).update({
    isV2Certification: true,
  });
};

exports.down = function (_) {
  // un rollback serait contre-productif
  return Promise.resolve();
};
