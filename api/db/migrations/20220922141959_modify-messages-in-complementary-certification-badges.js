import bluebird from 'bluebird';
const {
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
} = require('../constants').badges.keys;

export const up = async function (knex) {
  const badges = await knex('complementary-certification-badges')
    .select('complementary-certification-badges.id', 'key')
    .join('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .whereIn('key', [
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
    ]);
  await bluebird.each(badges, async ({ id, key }) => {
    let levelName;
    if ([PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE, PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE].includes(key)) {
      levelName = 'Initié (entrée dans le métier)';
    }
    if (
      [
        PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      ].includes(key)
    ) {
      levelName = 'Confirmé';
    }
    if ([PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE].includes(key)) {
      levelName = 'Avancé';
    }
    if ([PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT].includes(key)) {
      levelName = 'Expert';
    }

    const certificateMessage = `Vous avez obtenu la certification Pix+Édu niveau “${levelName}”`;
    const temporaryCertificateMessage = `Vous avez obtenu le niveau “${levelName}” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2`;

    await knex('complementary-certification-badges')
      .update({ certificateMessage, temporaryCertificateMessage })
      .where({ id });
  });
};

export const down = function () {
  // do nothing.
};
