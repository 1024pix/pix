const TABLE_NAME = 'complementary-certification-badges';
const COLUMN_NAME = 'imageUrl';
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
} = require('../constants').badges.keys;

import bluebird from 'bluebird';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME);
  });

  const data = [
    { imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg', key: PIX_DROIT_MAITRE_CERTIF },
    { imageUrl: 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg', key: PIX_DROIT_EXPERT_CERTIF },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-1-Initie-certif.svg',
      key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme-certif.svg',
      key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-2-Confirme-certif.svg',
      key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-3-Avance-certif.svg',
      key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-4-Expert-certif.svg',
      key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-Autonome_PREMIER-DEGRE.svg',
      key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-confirme_PREMIER-DEGRE.svg',
      key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-confirme_PREMIER-DEGRE.svg',
      key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-avance_PREMIER-DEGRE.svg',
      key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix_plus_Edu-certif-Expert_PREMIER-DEGRE.svg',
      key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix-emploi.svg',
      key: PIX_EMPLOI_CLEA_V1,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix-emploi.svg',
      key: PIX_EMPLOI_CLEA_V2,
    },
    {
      imageUrl: 'https://images.pix.fr/badges/Pix-emploi.svg',
      key: PIX_EMPLOI_CLEA_V3,
    },
  ];

  await bluebird.mapSeries(data, addImageUrlForBadgeKey);

  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME).notNullable().alter();
  });

  async function addImageUrlForBadgeKey({ imageUrl, key }) {
    await knex(TABLE_NAME)
      .update({ imageUrl })
      .where({ badgeId: knex('badges').select('id').where({ key }) });
  }
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
