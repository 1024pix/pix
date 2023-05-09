const TABLE_NAME = 'target-profiles';
const DEFAULT_IMAGE_URL = 'https://images.pix.fr/profil-cible/Illu_GEN.svg';

const up = async function(knex) {
  await updateWithDefaultImageUrl(knex);
};

const down = function() {
  return;
};

export { up, down };

async function updateWithDefaultImageUrl(knex) {
  await knex(TABLE_NAME).whereNull('imageUrl').update({
    imageUrl: DEFAULT_IMAGE_URL,
  });
}
