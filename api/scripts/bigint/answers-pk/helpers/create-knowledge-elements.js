const DatabaseBuilder = require('../../../../db/database-builder/database-builder');
const { knex } = require('../../../../db/knex-database-connection');
const databaseBuilder = new DatabaseBuilder({ knex });

const range = {
  toMigrate: { start: 1, end: 50 },
  alreadyMigrated: 10,
};

const createKnowledgeElements = async function () {
  for (let id = range.toMigrate.start; id <= range.toMigrate.end + range.alreadyMigrated; id++) {
    databaseBuilder.factory.buildKnowledgeElement({ id });
  }
  await databaseBuilder.commit();
};

const markKnowledgeElementsAsNotMigrated = async function () {
  await knex('knowledge-elements')
    .whereBetween('id', [range.toMigrate.start, range.toMigrate.end])
    .update({ answer_bigintId: -1 });
};

const setupMigration = async function () {
  await knex('bigint-migration-settings').insert({
    table: 'knowledge-elements',
    isScheduled: true,
    pauseMilliseconds: 5000,
    chunkSize: 10,
    startAt: 1,
    endAt: 50,
  });
};

const main = async () => {
  await createKnowledgeElements();
  await markKnowledgeElementsAsNotMigrated();
  await setupMigration();
};

const executeIfLaunchedByCLIElseExposeModuleForTest = () => {
  if (require.main === module) {
    main().then(
      () => {
        console.log('60 knowledge elements created (10 already migrated), with matching migration settings');
        console.log('To complete migration, execute node ./scripts/bigint/answers-pk/run-knowledge-elements');
        console.log('To suspend migration, execute the following query');
        console.log(
          `UPDATE "bigint-migration-settings" SET "isScheduled" = FALSE WHERE "table" = 'knowledge-elements';`
        );
        process.exit(0);
      },
      (error) => {
        console.error(error);
        process.exit(1);
      }
    );
  } else {
    module.exports = {
      databaseBuilder,
      main,
    };
  }
};

executeIfLaunchedByCLIElseExposeModuleForTest();
