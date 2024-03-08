const up = async function (knex) {
  await knex.schema.raw(`ALTER TYPE "organization-imports-statuses" ADD VALUE 'UPLOAD_ERROR'`);
};

const down = async function () {
  // nothing
};

export { down, up };
