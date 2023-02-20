import { knex, disconnect } from '../../db/knex-database-connection';

async function hideSkills() {
  await knex('organizations').where('showSkills', true).update({ showSkills: false });
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  await hideSkills();
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export default {
  hideSkills,
};
