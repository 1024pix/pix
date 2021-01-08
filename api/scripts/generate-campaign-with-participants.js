const { chunk, sample, sampleSize } = require('lodash');
const { knex } = require('../db/knex-database-connection');
const competenceRepository = require('../lib/infrastructure/repositories/competence-repository');
const skillRepository = require('../lib/infrastructure/repositories/skill-repository');
const targetProfileRepository = require('../lib/infrastructure/repositories/target-profile-repository');

const firstKECreatedAt = new Date('2020-05-01');
const secondKECreatedAt = new Date('2020-05-02');
const participationSharedAt = new Date('2020-05-03');
let lowRAMMode = false;
let progression = 0;
function _logProgression(totalCount) {
  ++progression;
  process.stdout.cursorTo(0);
  process.stdout.write(`${Math.round(progression * 100 / totalCount, 2)} %`);
}

function _resetProgression() {
  progression = 0;
}

function _getChunkSize(objectToBeInserted) {
  // PostgreSQL autorise au maximum 65536 paramètres bindés dans les requêtes
  const MAX_BINDED_PG = 65536;
  if (objectToBeInserted) {
    return Math.floor(MAX_BINDED_PG / Object.keys(objectToBeInserted).length) - 1;
  }
  return MAX_BINDED_PG;
}

function _printUsage() {
  console.log(`
  node generate-campaign-with-participants.js [OPTIONS]
    --organizationId id       : Id de l'organisation à laquelle on souhaite attacher la campagne
    --participantCount count  : Nombre de participants à la campagne
    --campaignType type       : Type de la campagne (case insensitive). Valeurs possibles : assessment | profiles_collection
    --profileType type        : Type du targetProfile (case insensitive). Valeurs possibles : light | medium | all
                                light : 1 compétence, medium : la moitié des compétences, all : toutes les compétences
                                Option ignorée si le type de la campagne est profiles_collection
    --lowRAM                  : Flag optionnel. Indique que la machine dispose de peu de RAM. Réalise donc la même
                                opération en consommant moins de RAM (opération ralentie).
    --help ou -h              : Affiche l'aide`);
}

function _getIdentifier(uniqId) {
  return `_${Math.random().toString(36).substr(2, 9)}_${uniqId}`;
}

function _validateAndNormalizeOrganizationId(commandLineArgs) {
  const commandLineArgsLength = commandLineArgs.length;
  const organizationIdIndicatorIndex = commandLineArgs.findIndex((commandLineArg) => commandLineArg === '--organizationId');
  if (organizationIdIndicatorIndex === -1 || organizationIdIndicatorIndex + 1 >= commandLineArgsLength) {
    throw new Error('ID de l\'organisation obligatoire.');
  }
  const organizationId = parseInt(commandLineArgs[organizationIdIndicatorIndex + 1]);
  if (isNaN(organizationId)) {
    throw new Error(`ID de l'organisation fourni ${commandLineArgs[organizationIdIndicatorIndex + 1]} n'est pas un entier.`);
  }
  return organizationId;
}

function _validateAndNormalizeParticipantCount(commandLineArgs) {
  const commandLineArgsLength = commandLineArgs.length;
  const participantCountIndicatorIndex = commandLineArgs.findIndex((commandLineArg) => commandLineArg === '--participantCount');
  if (participantCountIndicatorIndex === -1 || participantCountIndicatorIndex + 1 >= commandLineArgsLength) {
    throw new Error('Nombre de participants obligatoire.');
  }
  const participantCount = parseInt(commandLineArgs[participantCountIndicatorIndex + 1]);
  if (isNaN(participantCount)) {
    throw new Error(`Nombre de participations fourni ${commandLineArgs[participantCountIndicatorIndex + 1]} n'est pas un entier.`);
  }
  return participantCount;
}

function _validateAndNormalizeProfileType(commandLineArgs) {
  const commandLineArgsLength = commandLineArgs.length;
  const profileTypeIndicatorIndex = commandLineArgs.findIndex((commandLineArg) => commandLineArg === '--profileType');
  if (profileTypeIndicatorIndex === -1 || profileTypeIndicatorIndex + 1 >= commandLineArgsLength) {
    throw new Error('Type de profil obligatoire.');
  }
  const profileType = commandLineArgs[profileTypeIndicatorIndex + 1].toLowerCase();
  if (!['light', 'medium', 'all'].includes(profileType)) {
    throw new Error(`Type de profil doit être une valeur parmi light, medium et all, ${commandLineArgs[profileTypeIndicatorIndex + 1]} fourni.`);
  }
  return profileType;
}

function _validateAndNormalizeCampaignType(commandLineArgs) {
  const commandLineArgsLength = commandLineArgs.length;
  const campaignTypeIndicatorIndex = commandLineArgs.findIndex((commandLineArg) => commandLineArg === '--campaignType');
  if (campaignTypeIndicatorIndex === -1 || campaignTypeIndicatorIndex + 1 >= commandLineArgsLength) {
    throw new Error('Type de campagne obligatoire.');
  }
  const campaignType = commandLineArgs[campaignTypeIndicatorIndex + 1].toUpperCase();
  if (!['ASSESSMENT', 'PROFILES_COLLECTION'].includes(campaignType)) {
    throw new Error(`Type de campagne doit être une valeur parmi assessment et profiles_collection, ${commandLineArgs[campaignTypeIndicatorIndex + 1]} fourni.`);
  }
  return campaignType;
}

function _validateAndNormalizeArgs(commandLineArgs) {
  if (commandLineArgs.find((commandLineArg) => (commandLineArg === '--help' || commandLineArg === '-h'))) {
    _printUsage();
    process.exit(0);
  }
  if (commandLineArgs.find((commandLineArg) => commandLineArg === '--lowRAM')) {
    lowRAMMode = true;
  }
  const campaignType = _validateAndNormalizeCampaignType(commandLineArgs);
  return {
    organizationId: _validateAndNormalizeOrganizationId(commandLineArgs),
    participantCount: _validateAndNormalizeParticipantCount(commandLineArgs),
    profileType: campaignType === 'ASSESSMENT' ? _validateAndNormalizeProfileType(commandLineArgs) : 'all',
    campaignType,
  };
}

async function _createTargetProfile({ profileType }) {
  const competences = await competenceRepository.listPixCompetencesOnly();
  const competencesInProfile = profileType === 'light' ? [sample(competences)]
    : profileType === 'medium' ? sampleSize(competences, Math.round(competences.length / 2))
      : competences;
  const [targetProfileId] = await knex('target-profiles')
    .returning('id')
    .insert({ name: 'SomeTargetProfile' });
  for (const competence of competencesInProfile) {
    const skills = await skillRepository.findOperativeByCompetenceId(competence.id);
    for (const skill of skills) {
      await knex('target-profiles_skills')
        .insert({ targetProfileId, skillId: skill.id });
    }
  }

  return targetProfileRepository.get(targetProfileId);
}

async function _createCampaign({ organizationId, campaignType, targetProfileId }) {
  const doesOrganizationExist = await knex('organizations')
    .where({ id: organizationId })
    .first();
  if (!doesOrganizationExist) {
    throw new Error(`Organisation ${organizationId} n'existe pas.`);
  }
  const { userId: adminMemberId } = await knex.select('userId')
    .from('memberships')
    .where({ organizationId, organizationRole: 'ADMIN' })
    .first();
  if (!adminMemberId) {
    throw new Error(`Organisation ${organizationId} n'a pas de membre ADMIN.`);
  }
  const [campaignId] = await knex('campaigns')
    .returning('id')
    .insert({
      name: `Campaign_${organizationId}_${targetProfileId}`,
      code: 'FAKECODE',
      organizationId,
      creatorId: adminMemberId,
      targetProfileId,
      type: campaignType,
    });

  return campaignId;
}

async function _createUsers({ count, uniqId, trx }) {
  const userData = [];
  for (let i = 0; i < count; ++i) {
    const identifier = _getIdentifier(uniqId);
    userData.push({
      firstName: `firstName${identifier}`,
      lastName: `lastName${identifier}`,
      email: `email${identifier}@example.net`,
      password: 'salut',
    });
  }
  const chunkSize = _getChunkSize(userData[0]);
  return trx.batchInsert('users', userData.flat(), chunkSize).returning('id');
}

async function _createAssessments({ userAndCampaignParticipationIds, trx }) {
  const assessmentData = [];
  for (const userAndCampaignParticipationId of userAndCampaignParticipationIds) {
    assessmentData.push({
      userId: userAndCampaignParticipationId.userId,
      campaignParticipationId: userAndCampaignParticipationId.id,
      state: 'completed',
      type: 'CAMPAIGN',
    });
  }
  const chunkSize = _getChunkSize(assessmentData[0]);
  return trx.batchInsert('assessments', assessmentData.flat(), chunkSize).returning(['id', 'userId']);
}

async function _createCampaignParticipations({ campaignId, userIds, trx }) {
  const participationData = [];
  for (const userId of userIds) {
    participationData.push({
      campaignId,
      createdAt: participationSharedAt,
      isShared: true,
      sharedAt: participationSharedAt,
      userId,
    });
  }
  const chunkSize = _getChunkSize(participationData[0]);
  return trx.batchInsert('campaign-participations', participationData.flat(), chunkSize).returning(['id', 'userId']);
}

async function _createAnswersAndKnowledgeElements({ targetProfile, userAndAssessmentIds, trx }) {
  console.log('\tCréation des answers de référence...');
  const answerData = [];
  for (const userAndAssessmentId of userAndAssessmentIds) {
    answerData.push({
      value: 'someValue',
      assessmentId: userAndAssessmentId.id,
      challengeId: 'someChallengeId',
    });
  }
  const chunkSize = _getChunkSize(answerData[0]);
  const answerRecordedData = await trx.batchInsert('answers', answerData.flat(), chunkSize).returning(['id', 'assessmentId']);
  console.log('\tOK');

  console.log('\tCréation des knowledge-elements...');
  const knowledgeElementData = [];
  console.log('\t\tCréation des données par acquis...');
  for (const skill of targetProfile.skills) {
    const knowledgeElementDataForOneSkill = [];
    for (const userAndAssessmentId of userAndAssessmentIds) {
      const status = Math.random() < 0.7 ?
        'validated' : 'invalidated';
      const referenceAnswer = answerRecordedData.find((answerRecordedItem) => {
        return answerRecordedItem.assessmentId === userAndAssessmentId.id;
      });
      const knowledgeElementProps = {
        source: 'direct',
        status,
        assessmentId: referenceAnswer.assessmentId,
        skillId: skill.id,
        earnedPix: status === 'validated' ? skill.pixValue : 0,
        userId: userAndAssessmentIds.find((userAndAssessmentId) => userAndAssessmentId.id === referenceAnswer.assessmentId).userId,
        competenceId: skill.competenceId,
        answerId: referenceAnswer.id,
      };
      knowledgeElementDataForOneSkill.push({
        ...knowledgeElementProps,
        createdAt: firstKECreatedAt,
      });
      knowledgeElementDataForOneSkill.push({
        ...knowledgeElementProps,
        createdAt: secondKECreatedAt,
      });
    }
    knowledgeElementData.push(knowledgeElementDataForOneSkill);
    _logProgression(targetProfile.skills.length);
  }
  _resetProgression();
  console.log('\t\tOK');

  console.log('\t\tInsertion en base de données...');
  const chunkedKnowledgeElements = chunk(knowledgeElementData.flat(), _getChunkSize(knowledgeElementData[0][0]));
  let totalKeCount = 0;
  for (const chunk of chunkedKnowledgeElements) {
    await trx('knowledge-elements').insert(chunk);
    totalKeCount = totalKeCount + chunk.length;
    _logProgression(chunkedKnowledgeElements.length);
  }
  console.log('\t\tOK');
  console.log(`\t${totalKeCount} knowledge-elements créés`);
  console.log('\tOK');
}

async function _createParticipants({ count, targetProfile, campaignId, trx }) {
  console.log('Création des utilisateurs...');
  const userIds = await _createUsers({ count, uniqId: targetProfile.id, trx });
  console.log('OK');
  console.log('Création des campaign-participations...');
  const userAndCampaignParticipationIds = await _createCampaignParticipations({ campaignId, userIds, trx });
  console.log('OK');
  console.log('Création des assessments...');
  const userAndAssessmentIds = await _createAssessments({ userAndCampaignParticipationIds, trx });
  console.log('OK');
  console.log('Création des answers/knowledge-elements...');
  await _createAnswersAndKnowledgeElements({ targetProfile, userAndAssessmentIds, trx });
  console.log('OK');
}

async function _do({ organizationId, participantCount, profileType, campaignType }) {
  console.log('Création du targetProfile...');
  const targetProfile = await _createTargetProfile({ profileType });
  console.log('OK');
  console.log('Création de la campagne...');
  const campaignId = await _createCampaign({ organizationId, campaignType, targetProfileId: targetProfile.id });
  console.log('OK');
  const trx = await knex.transaction();
  if (lowRAMMode) {
    console.log('Mode lowRAM activé. Découpage de l\'opération en plusieurs paquets de 150 participants.');
    let participantLeftToProcess = participantCount;
    const PARTICIPANT_CHUNK_SIZE = 500;
    while (participantLeftToProcess > 0) {
      console.log(`Reste à traiter : ${participantLeftToProcess} participants`);
      participantLeftToProcess = participantLeftToProcess - PARTICIPANT_CHUNK_SIZE;
      await _createParticipants({ count: PARTICIPANT_CHUNK_SIZE, targetProfile, campaignId, trx });
    }
  } else {
    await _createParticipants({ count: participantCount, targetProfile, campaignId, trx });
  }
  await trx.commit();
  console.log(`Campagne: ${campaignId}\nOrganisation: ${organizationId}\nNombre de participants: ${participantCount}\nTargetProfile: ${targetProfile.id}`);
}

async function main() {
  try {
    const commandLineArgs = process.argv.slice(2);
    console.log('Validation des arguments...');
    const {
      organizationId,
      participantCount,
      profileType,
      campaignType,
    } = _validateAndNormalizeArgs(commandLineArgs);

    console.log('OK');
    await _do({
      organizationId,
      participantCount,
      profileType,
      campaignType,
    });
    console.log('FIN');
  } catch (error) {
    console.error(error);
    _printUsage();
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}
