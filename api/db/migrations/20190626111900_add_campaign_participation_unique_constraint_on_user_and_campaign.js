const TABLE_NAME = 'campaign-participations';

export const up = async function (knex) {
  await knex.raw(`
    DELETE FROM "campaign-participations"
    WHERE id IN (
      SELECT cp.id
      FROM "campaign-participations" AS cp
      INNER JOIN "campaign-participations" AS cpbis
      ON cp."campaignId" = cpbis."campaignId" AND cp."userId" = cpbis."userId"
      WHERE cp.id != cpbis.id
      AND cp."createdAt" < cpbis."createdAt"
    );
  `);

  await knex.schema.table(TABLE_NAME, (table) => {
    table.unique(['campaignId', 'userId']);
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, (table) => {
    table.dropUnique(['campaignId', 'userId']);
  });
};
