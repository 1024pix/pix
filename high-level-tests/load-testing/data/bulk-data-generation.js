const execa = require('execa');

const databaseConnectionString = process.env.DATABASE_URL;

async function run() {

  const initialUserCount = await getUserCount();
  await bulkDataGeneration();
  const finalUserCount = await getUserCount();

  const usersGenerated = finalUserCount - initialUserCount;
  if (usersGenerated === 0) {
    console.error('Aucune donnée générée');
    process.exit(1);
  } else {
    console.info(`${usersGenerated} utilisateurs générés`);
  }
}
async function getUserCount() {
  const dataGenerationQueryCheck = 'SELECT COUNT(1) FROM users';
  const { stdout } = await execa.sync('psql', [databaseConnectionString, '--tuples-only', '--command', dataGenerationQueryCheck]);
  return isNaN(parseInt(stdout)) ? 0 : parseInt(stdout);
}

async function bulkDataGeneration() {
  const scriptPath = './data/generate_mass_data.sql';
  const launchGenerationScriptCommand = `psql ${databaseConnectionString} -v ON_ERROR_STOP=1 --echo-all --file=${scriptPath}`;
  await execa.sync(launchGenerationScriptCommand, { stdio: 'inherit', shell: true });
}

module.exports = {
  run,
};

