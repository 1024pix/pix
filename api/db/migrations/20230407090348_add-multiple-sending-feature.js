const TABLE_NAME = 'features';
const MULTIPLE_SENDING_KEY = 'MULTIPLE_SENDING_ASSESSMENT';

const up = function (knex) {
  return knex(TABLE_NAME).insert({
    key: MULTIPLE_SENDING_KEY,
    description: "Permet d'activer l'envoi multiple sur les campagnes d'évaluation",
  });
};

const down = function (knex) {
  return knex(TABLE_NAME).where({ key: MULTIPLE_SENDING_KEY }).delete();
};

export { up, down };
