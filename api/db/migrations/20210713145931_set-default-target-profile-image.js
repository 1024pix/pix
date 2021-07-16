const TABLE_NAME = 'target-profiles';
const DEFAULT_IMAGE_URL = 'https://storage.gra.cloud.ovh.net/v1/AUTH_27c5a6d3d35841a5914c7fb9a8e96345/pix-images/profil-cible/Illu_GEN.svg';

exports.up = async function(knex) {
  await updateWithDefaultImageUrl(knex);
  await setImageUrlDefaultValue(knex);
};

exports.down = function() {
};

async function updateWithDefaultImageUrl(knex) {
  await knex(TABLE_NAME)
    .whereNull('imageUrl')
    .update({
      imageUrl: DEFAULT_IMAGE_URL,
    });
}

async function setImageUrlDefaultValue(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.string('imageUrl').notNullable().defaultTo(DEFAULT_IMAGE_URL).alter();
  });
}
