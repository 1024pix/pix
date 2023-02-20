const TABLE_NAME = 'certification-courses';

export const up = function (knex) {
  return knex(TABLE_NAME).where('createdAt', '>', '2021-01-01').andWhere('isV2Certification', false).update({
    isV2Certification: true,
  });
};

export const down = function (_) {
  // un rollback serait contre-productif
  return Promise.resolve();
};
