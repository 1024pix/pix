const DatabaseBuilder = require('../../../../db/database-builder/database-builder');
const { knex } = require('../../../../db/knex-database-connection');
const databaseBuilder = new DatabaseBuilder({ knex });

const range = {
  toMigrate: { start: 1, end: 50 },
  alreadyMigrated: 10,
};

const createAnswers = async function () {
  for (let id = range.toMigrate.start; id <= range.toMigrate.end + range.alreadyMigrated; id++) {
    databaseBuilder.factory.buildAnswer({ id });
  }
  await databaseBuilder.commit();
};

const markAnswersAsNotMigrated = async function () {
  await knex('answers').whereBetween('id', [range.toMigrate.start, range.toMigrate.end]).update({ bigintId: -1 });
};

const setupMigration = async function () {
  await knex('bigint-migration-settings').insert({
    table: 'answers',
    isScheduled: true,
    pauseMilliseconds: 5000,
    chunkSize: 10,
    startAt: 1,
    endAt: 50,
  });
};

const main = async () => {
  await createAnswers();
  await markAnswersAsNotMigrated();
  await setupMigration();
};

const executeIfLaunchedByCLIElseExposeModuleForTest = () => {
  if (require.main === module) {
    main().then(
      () => {
        console.log('60 answers created (10 already migrated), with matching migration settings');
        console.log('To complete migration, execute node ./scripts/bigint/answers-pk/run');
        console.log('To suspend migration, execute the following query');
        console.log(`UPDATE "bigint-migration-settings" SET "isScheduled" = FALSE WHERE "table" = 'answers';`);
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
