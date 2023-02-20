const TABLE_NAME = 'complementary-certification-badges';
const COLUMN_NAME = 'label';
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
    { label: 'Pix+ Droit Maître', key: PIX_DROIT_MAITRE_CERTIF },
    { label: 'Pix+ Droit Expert', key: PIX_DROIT_EXPERT_CERTIF },
    {
      label: 'Pix+ Édu 2nd degré Initié (entrée dans le métier)',
      key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
    },
    {
      label: 'Pix+ Édu 2nd degré Confirmé',
      key: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
    },
    {
      label: 'Pix+ Édu 2nd degré Confirmé',
      key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
    },
    {
      label: 'Pix+ Édu 2nd degré Avancé',
      key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
    },
    {
      label: 'Pix+ Édu 2nd degré Expert',
      key: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
    },
    {
      label: 'Pix+ Édu 1er degré Initié (entrée dans le métier)',
      key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
    },
    {
      label: 'Pix+ Édu 1er degré Confirmé',
      key: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
    },
    {
      label: 'Pix+ Édu 1er degré Confirmé',
      key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
    },
    {
      label: 'Pix+ Édu 1er degré Avancé',
      key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
    },
    {
      label: 'Pix+ Édu 1er degré Expert',
      key: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
    },
    {
      label: 'CléA Numérique',
      key: PIX_EMPLOI_CLEA_V1,
    },
    {
      label: 'CléA Numérique',
      key: PIX_EMPLOI_CLEA_V2,
    },
    {
      label: 'CléA Numérique',
      key: PIX_EMPLOI_CLEA_V3,
    },
  ];

  await bluebird.mapSeries(data, addLabelForBadgeKey);

  await knex.schema.alterTable(TABLE_NAME, function (table) {
    table.string(COLUMN_NAME).notNullable().alter();
  });

  async function addLabelForBadgeKey({ label, key }) {
    await knex(TABLE_NAME)
      .update({ label })
      .where({ badgeId: knex('badges').select('id').where({ key }) });
  }
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(COLUMN_NAME);
  });
};
