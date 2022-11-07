const { PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3 } = require('../constants').badges.keys;

const TABLE_NAME = 'badges';
const CLEA_KEYS = [PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3];

exports.up = function (knex) {
  return knex(TABLE_NAME).update({ isCertifiable: true }).whereIn('key', CLEA_KEYS);
};

exports.down = function (knex) {
  return knex(TABLE_NAME).update({ isCertifiable: false }).whereIn('key', CLEA_KEYS);
};
