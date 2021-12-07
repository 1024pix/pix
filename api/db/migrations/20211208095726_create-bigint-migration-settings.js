exports.up = async function(knex) {
  await knex.raw(`CREATE TABLE "bigint-migration-settings" (
                    "table" TEXT NOT NULL UNIQUE CHECK ("table" IN ('answers','knowledge-elements')),
                    "isScheduled" BOOLEAN NOT NULL,
                    "pauseMilliseconds" INTEGER NOT NULL CHECK ("pauseMilliseconds" >= 0),
                    "chunkSize" INTEGER NOT NULL CHECK ("chunkSize" > 0),
                    "startAt" INTEGER NOT NULL CHECK ("startAt" > 0),
                    "endAt" INTEGER NOT NULL CHECK ("startAt" <= "endAt")
                    )`);

  const result = await knex.raw('SELECT NEXTVAL(\'answers_id_seq\') AS value');
  const currentSequenceValue = result.rows[0].value;

  const settings = {
    table: 'answers',
    isScheduled: false,
    pauseMilliseconds: 0,
    chunkSize: 10000,
    startAt: 1,
    endAt: currentSequenceValue,
  };
  await knex('bigint-migration-settings').insert(settings);
};

exports.down = async function(knex) {
  await knex.raw('DROP TABLE "bigint-migration-settings"');
};
