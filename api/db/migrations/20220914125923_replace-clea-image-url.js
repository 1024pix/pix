const TABLE_NAME = 'complementary-certification-badges';
const newUrl = 'https://images.pix.fr/badges/CleA_Num_certif.svg';
const oldUrl = 'https://images.pix.fr/badges/Pix-emploi.svg';

const up = async function (knex) {
  await knex(TABLE_NAME).update({ imageUrl: newUrl }).where({ imageUrl: oldUrl });
};

const down = async function (knex) {
  await knex(TABLE_NAME).update({ imageUrl: oldUrl }).where({ imageUrl: newUrl });
};

export { up, down };
