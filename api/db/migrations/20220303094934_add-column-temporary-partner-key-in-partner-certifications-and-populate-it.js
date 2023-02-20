const {
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('../constants').badges.keys;

const pixEduBadges = [
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
]
  .map((badge) => `'${badge}'`)
  .join(',');

export const up = async function (knex) {
  await knex.schema.alterTable('partner-certifications', function (table) {
    table.string('partnerKey').nullable().alter();
    table.string('temporaryPartnerKey').references('badges.key').nullable();
  });

  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `UPDATE "partner-certifications" SET "temporaryPartnerKey" = "partnerKey", "partnerKey" = NULL WHERE "partnerKey" IN (${pixEduBadges})`
  );
};

export const down = async function (knex) {
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(
    `UPDATE "partner-certifications" SET "partnerKey" = "temporaryPartnerKey" WHERE "temporaryPartnerKey" IN (${pixEduBadges})`
  );

  await knex.schema.alterTable('partner-certifications', function (table) {
    table.dropColumn('temporaryPartnerKey');
    table.string('partnerKey').notNullable().alter();
  });
};
