const TABLE_NAME = 'badges';
const COLUMN_NAME = 'imageUrl';
const OVH_URL = 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images';
const PIX_URL = 'https://images.pix.fr';

exports.up = function(knex) {
  return knex.raw(`UPDATE ${TABLE_NAME} SET "${COLUMN_NAME}" = REPLACE("${COLUMN_NAME}", '${OVH_URL}', '${PIX_URL}') WHERE "${COLUMN_NAME}" LIKE '${OVH_URL}%';`);
};

exports.down = function() {

};
