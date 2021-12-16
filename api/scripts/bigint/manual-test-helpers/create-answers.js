require('dotenv').config();
const logger = require('../../../lib/infrastructure/logger');
const DatabaseBuilder = require('../../../db/database-builder/database-builder');
const { knex } = require('../../../db/knex-database-connection');
const databaseBuilder = new DatabaseBuilder({ knex });

const range = { startingAt: 1, count: 100 };

const checkAnswersTableIsEmpty = async function () {
  const { count } = await knex.from('answers').count('id').first();
  if (count !== 0) {
    throw new Error('answers table is not empty, execute npm run db:prepare and start again');
  }
};

const alignSequence = async function () {
  const currentSequenceExpectedValue = range.startingAt + range.count;
  // eslint-disable-next-line knex/avoid-injections
  await knex.raw(`ALTER SEQUENCE "answers_id_seq" RESTART WITH ${currentSequenceExpectedValue}`);
};

const createAnswers = async function () {
  for (let id = range.startingAt; id <= range.count; id++) {
    databaseBuilder.factory.buildAnswer({ id });
  }
  await databaseBuilder.commit();
};

const main = async () => {
  await checkAnswersTableIsEmpty();
  await createAnswers();
  await alignSequence();
};

if (require.main === module) {
  main().then(
    () => {
      logger.info(` ${range.count} answers created, starting at id ${range.startingAt}`);
      process.exit(0);
    },
    (error) => {
      logger.error(error.message);
      process.exit(1);
    }
  );
}
