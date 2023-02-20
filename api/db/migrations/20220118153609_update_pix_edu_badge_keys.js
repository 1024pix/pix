export const up = async function (knex) {
  await knex.schema.alterTable('partner-certifications', (table) => {
    table.dropForeign(null, 'certification_partner_acquisitions_partnerkey_foreign');
  });

  await knex('badges')
    .where({ key: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME' })
    .update({ key: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE' });
  await knex('partner-certifications')
    .where({ partnerKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME' })
    .update({ partnerKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE' });

  await knex('badges')
    .where({ key: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE' })
    .update({ key: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME' });
  await knex('partner-certifications')
    .where({ partnerKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE' })
    .update({ partnerKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME' });

  await knex('badges')
    .where({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE' })
    .update({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME' });
  await knex('partner-certifications')
    .where({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE' })
    .update({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME' });

  await knex('badges')
    .where({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT' })
    .update({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE' });
  await knex('partner-certifications')
    .where({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT' })
    .update({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE' });

  await knex('badges')
    .where({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR' })
    .update({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT' });
  await knex('partner-certifications')
    .where({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR' })
    .update({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT' });

  await knex.schema.alterTable('partner-certifications', (table) => {
    table.foreign('partnerKey').references('key').inTable('badges');
  });
};

export const down = async function (knex) {
  await knex.schema.alterTable('partner-certifications', (table) => {
    table.dropForeign('partnerKey');
  });

  await knex('badges')
    .where({ key: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE' })
    .update({ key: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME' });
  await knex('partner-certifications')
    .where({ partnerKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE' })
    .update({ partnerKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AUTONOME' });

  await knex('badges')
    .where({ key: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME' })
    .update({ key: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE' });
  await knex('partner-certifications')
    .where({ partnerKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME' })
    .update({ partnerKey: 'PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE' });

  await knex('badges')
    .where({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME' })
    .update({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE' });
  await knex('partner-certifications')
    .where({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME' })
    .update({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE' });

  await knex('badges')
    .where({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE' })
    .update({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT' });
  await knex('partner-certifications')
    .where({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE' })
    .update({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT' });

  await knex('badges')
    .where({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT' })
    .update({ key: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR' });
  await knex('partner-certifications')
    .where({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT' })
    .update({ partnerKey: 'PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR' });

  await knex.schema.alterTable('partner-certifications', (table) => {
    table.foreign(null, 'certification_partner_acquisitions_partnerkey_foreign').references('key').inTable('badges');
  });
};
