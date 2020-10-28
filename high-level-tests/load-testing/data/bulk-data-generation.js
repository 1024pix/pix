const execa = require('execa');

async function run() {

  const databaseConnectionString = process.env.DATABASE_URL;

  const initialUserCount = await getUserCount(databaseConnectionString);
  await bulkDataGeneration(databaseConnectionString);
  const finalUserCount = await getUserCount(databaseConnectionString);

  const usersGenerated = finalUserCount - initialUserCount;
  if (usersGenerated === 0) {
    console.error('Aucune donnée générée');
    process.exit(1);
  } else {
    console.info(`${usersGenerated} utilisateurs générés`);
  }
}

async function getUserCount(databaseConnectionString) {
  const dataGenerationQueryCheck = 'SELECT COUNT(1) FROM users';
  const { stdout } = await execa.sync('psql', [databaseConnectionString, '--tuples-only', '--command', dataGenerationQueryCheck]);
  return isNaN(parseInt(stdout)) ? 0 : parseInt(stdout);
}

async function bulkDataGeneration(databaseConnectionString) {
  const scriptPath = './data/generate_mass_data.sql';
  const variableCommand = getVariableCommand();

  const launchGenerationScriptCommand = `psql ${databaseConnectionString} -v ON_ERROR_STOP=1 --echo-all ${variableCommand} --file=${scriptPath}`;
  await execa.sync(launchGenerationScriptCommand, { stdio: 'inherit', shell: true });
}

function getVariableCommand() {
  const configuration = getConfiguration();
  return  `--variable user_count=${configuration.userCount} \\
           --variable competence_evaluation_count=${configuration.competence_evaluation_count} \\
           --variable organization_count=${configuration.organization_count} \\
           --variable campaign_per_organization_count=${configuration.campaign_per_organization_count} \\
           --variable participation_per_campaign_count=${configuration.participation_per_campaign_count} \\
           --variable shared_participation_percentage=${configuration.shared_participation_percentage} \\
           --variable answer_per_competence_evaluation_assessment_count=${configuration.answer_per_competence_evaluation_assessment_count} \\
           --variable answer_per_campaign_assessment_count=${configuration.answer_per_campaign_assessment_count} \\
           --variable validated_knowledge_element_percentage=${configuration.validated_knowledge_element_percentage} \\
           --variable invalidated_knowledge_element_percentage=${configuration.invalidated_knowledge_element_percentage}`;
}

function getConfiguration() {
  return ({
    userCount: (1000 || process.env.USER_COUNT),
    competence_evaluation_count: (1000 || process.env.COMPETENCE_EVALUATION_COUNT),
    organization_count: (0 || process.env.ORGANIZATION_COUNT),
    campaign_per_organization_count: (3 || process.env.CAMPAIGN_PER_ORGANIZATION_COUNT),
    participation_per_campaign_count: (150 || process.env.PARTICIPATION_PER_CAMPAIGN_COUNT),
    shared_participation_percentage: (65 || process.env.SHARED_PARTICIPATION_PERCENTAGE),
    answer_per_competence_evaluation_assessment_count: (25 || process.env.ANSWER_PER_COMPETENCE_EVALUATION_ASSESSMENT_COUNT),
    answer_per_campaign_assessment_count: (25 || process.env.ANSWER_PER_CAMPAIGN_ASSESSMENT_COUNT),
    validated_knowledge_element_percentage: (60 || process.env.VALIDATED_KNOWLEDGE_ELEMENT_PERCENTAGE),
    invalidated_knowledge_element_percentage: (30 || process.env.INVALIDATED_KNOWLEDGE_ELEMENT_PERCENTAGE),
  });
}

module.exports = {
  run,
};

