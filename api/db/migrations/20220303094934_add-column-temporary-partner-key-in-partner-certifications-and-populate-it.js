const bluebird = require('bluebird');
const {
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('../../lib/domain/models/Badge').keys;

exports.up = async function (knex) {
  await knex.schema.alterTable('partner-certifications', function (table) {
    table.string('partnerKey').nullable().alter();
    table.string('temporaryPartnerKey').references('badges.key').nullable();
  });

  const partnerCertificationsToUpdate = await knex('partner-certifications')
    .select('certificationCourseId', 'partnerKey')
    .whereIn('partnerKey', [
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
    ]);

  await bluebird.mapSeries(partnerCertificationsToUpdate, async function ({ partnerKey, certificationCourseId }) {
    await knex('partner-certifications').where({ partnerKey, certificationCourseId }).update({
      temporaryPartnerKey: partnerKey,
      partnerKey: null,
    });
  });
};

exports.down = async function (knex) {
  const partnerCertificationsToUpdate = await knex('partner-certifications')
    .select('certificationCourseId', 'temporaryPartnerKey')
    .whereIn('temporaryPartnerKey', [
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
      PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
      PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
    ]);

  await bluebird.mapSeries(
    partnerCertificationsToUpdate,
    async function ({ temporaryPartnerKey, certificationCourseId }) {
      await knex('partner-certifications').where({ temporaryPartnerKey, certificationCourseId }).update({
        partnerKey: temporaryPartnerKey,
        temporaryPartnerKey: null,
      });
    }
  );

  await knex.schema.alterTable('partner-certifications', function (table) {
    table.dropColumn('temporaryPartnerKey');
    table.string('partnerKey').notNullable().alter();
  });
};
