const up = async function (knex) {
  await knex.raw(`
  UPDATE "user-logins" t2
  SET "lastLoggedAt" = t1."lastLoggedAt"
  FROM "users" t1
    WHERE t1."id" = t2."userId"
    AND t2."lastLoggedAt" IS NULL
  ;
  `);

  await knex.raw(`
  INSERT INTO "user-logins"
  ("userId", "lastLoggedAt")
  SELECT "id", "lastLoggedAt"
  FROM "users"
  WHERE "lastLoggedAt" IS NOT NULL
  ON CONFLICT ("userId") DO NOTHING
  ;
  `);
};

const down = async function () {
  // do nothing, because it's impossible to rollback
};

export { up, down };
