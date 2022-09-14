const TABLE_NAME = 'complementary-certification-badges';
const newUrl = 'https://images.pix.fr/badges/CleA_Num_certif.svg';
const oldUrl = 'https://images.pix.fr/badges/Pix-emploi.svg';

exports.up = async function (knex) {
  await knex(TABLE_NAME).update({ imageUrl: newUrl }).where({ imageUrl: oldUrl });
};

exports.down = async function (knex) {
  await knex(TABLE_NAME).update({ imageUrl: oldUrl }).where({ imageUrl: newUrl });
};
