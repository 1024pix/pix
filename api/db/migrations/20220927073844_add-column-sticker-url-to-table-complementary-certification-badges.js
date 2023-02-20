import bluebird from 'bluebird';

const STICKERS_URL_BY_BADGE_KEY = {
  PIX_EMPLOI_CLEA: 'https://images.pix.fr/stickers/macaron_clea.pdf',
  PIX_EMPLOI_CLEA_V2: 'https://images.pix.fr/stickers/macaron_clea.pdf',
  PIX_EMPLOI_CLEA_V3: 'https://images.pix.fr/stickers/macaron_clea.pdf',
  PIX_EMPLOI_CLEA_V4: 'https://images.pix.fr/stickers/macaron_clea.pdf',
  PIX_DROIT_MAITRE_CERTIF: 'https://images.pix.fr/stickers/macaron_droit_maitre.pdf',
  PIX_DROIT_EXPERT_CERTIF: 'https://images.pix.fr/stickers/macaron_droit_expert.pdf',
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE: 'https://images.pix.fr/stickers/macaron_edu_2nd_initie.pdf',
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME: 'https://images.pix.fr/stickers/macaron_edu_2nd_confirme.pdf',
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME: 'https://images.pix.fr/stickers/macaron_edu_2nd_confirme.pdf',
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE: 'https://images.pix.fr/stickers/macaron_edu_2nd_avance.pdf',
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT: 'https://images.pix.fr/stickers/macaron_edu_2nd_expert.pdf',
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE: 'https://images.pix.fr/stickers/macaron_edu_1er_initie.pdf',
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME: 'https://images.pix.fr/stickers/macaron_edu_1er_confirme.pdf',
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME: 'https://images.pix.fr/stickers/macaron_edu_1er_confirme.pdf',
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE: 'https://images.pix.fr/stickers/macaron_edu_1er_avance.pdf',
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT: 'https://images.pix.fr/stickers/macaron_edu_1er_expert.pdf',
};

export const up = async function (knex) {
  await knex.schema.alterTable('complementary-certification-badges', (table) => {
    table.string('stickerUrl');
  });

  const certifiableBadges = await knex('badges').select('id', 'key').where({ isCertifiable: true });

  await bluebird.each(certifiableBadges, async ({ id: badgeId, key }) => {
    if (STICKERS_URL_BY_BADGE_KEY[key]) {
      await knex('complementary-certification-badges')
        .update({ stickerUrl: STICKERS_URL_BY_BADGE_KEY[key] })
        .where({ badgeId });
    }
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('complementary-certification-badges', (table) => {
    table.dropColumn('stickerUrl');
  });
};
