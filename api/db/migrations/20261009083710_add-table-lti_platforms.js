// Make sure you properly test your migration, especially DDL (Data Definition Language)
// ! If the target table is large, and the migration take more than 20 minutes, the deployment will fail !

// You can design and test your migration to avoid this by following this guide
// https://1024pix.atlassian.net/wiki/spaces/EDTDT/pages/3849323922/Cr+er+une+migration

// If your migrations target :
//
// `answers`
// `knowledge-elements`
// `knowledge-element-snapshots`
//
// contact @team-captains, because automatic migrations are not active on `pix-datawarehouse-production`
// this may prevent data replication to succeed the day after your migration is deployed on `pix-api-production`
const TABLE_NAME = 'lti_platforms';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments('id').primary();
    table.string('clientId').comment('ClientId attribué par la plateforme');
    table.string('platformOrigin').notNullable().comment("Url d'origine de la plateforme");
    table.string('status').notNullable().comment('Statut de la plateforme : PENDING, ACTIVE');
    table.jsonb('toolConfig').notNullable().comment("Configuration de Pix en tant qu'outils faite par la plateforme");
    table
      .string('encryptedPrivateKey')
      .notNullable()
      .comment('Clé privée, au format JWK, chiffrée pour la communication avec la plateforme');
    table.jsonb('publicKey').notNullable().comment('Clé publique au format JWK');
    table
      .string('platformOpenIdConfigUrl')
      .notNullable()
      .comment("URL permettant d'obtenir la configuration OpenId de la plateforme");
    table.timestamps(false, true, true);

    table.comment('Plateformes LTI authorisées - potentiellement plusieurs enregistrements pour une platforme');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}

