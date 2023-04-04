require('dotenv').config({ path: `${__dirname}/../../.env` });

const _ = require('lodash');
const { knex, disconnect } = require('../../db/knex-database-connection');
const { learningContentCache: cache } = require('../../lib/infrastructure/caches/learning-content-cache');
const moment = require('moment');
const competenceRepository = require('../../lib/infrastructure/repositories/competence-repository');
const skillRepository = require('../../lib/infrastructure/repositories/skill-repository');
const targetProfileRepository = require('../../lib/infrastructure/repositories/target-profile-repository');
const campaignRepository = require('../../lib/infrastructure/repositories/campaign-repository');
const CampaignParticipationStatuses = require('../../lib/domain/models/CampaignParticipationStatuses');
const computeParticipationResults = require('../prod/compute-participation-results');
const {
  getEligibleCampaignParticipations,
  generateKnowledgeElementSnapshots,
} = require('../prod/generate-knowledge-element-snapshots-for-campaigns');
const { generate } = require('../../lib/domain/services/campaigns/campaign-code-generator');

const { SHARED, TO_SHARE } = CampaignParticipationStatuses;

const firstKECreatedAt = new Date('2020-05-01');
const secondKECreatedAt = new Date('2020-05-02');
const baseDate = new Date('2023-01-01');
let lowRAMMode = false;
let progression = 0;
let LOG_ENABLE = false;

function _log(string) {
  if (LOG_ENABLE) {
    console.log(string);
  }
}

function _logProgression(totalCount) {
  ++progression;
  process.stdout.cursorTo(0);
  process.stdout.write(`${Math.round((progression * 100) / totalCount, 2)} %`);
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
  _log(`
  node generate-campaign-with-participants.js [OPTIONS]
    --organizationId id                 : Id de l'organisation à laquelle on souhaite attacher la campagne
    --participantCount count            : Nombre de participants à la campagne
    --campaignType type                 : Type de la campagne (case insensitive). Valeurs possibles : assessment | profiles_collection
    --targetProfileId id                : Id du profil cible qu'on souhaite appliqué au parcours
                                          Ignoré si la campagne est de type profiles_collection
    --profileType type                  : Type du targetProfile (case insensitive). Valeurs possibles : light | medium | all
                                             light : 1 compétence, medium : la moitié des compétences, all : toutes les compétences
                                             Option ignorée si le type de la campagne est profiles_collection
                                             Option ignorée si un profil cible est spécifié via --targetProfileId
    --lowRAM                            : Flag optionnel. Indique que la machine dispose de peu de RAM. Réalise donc la même
                                             opération en consommant moins de RAM (opération ralentie).
    --help ou -h                        : Affiche l'aide`);
}

function _getIdentifier(uniqId) {
  return `_${Math.random().toString(36).substr(2, 9)}_${uniqId}`;
}

function _validateAndNormalizeOrganizationId(commandLineArgs) {
  const commandLineArgsLength = commandLineArgs.length;
  const organizationIdIndicatorIndex = commandLineArgs.findIndex(
    (commandLineArg) => commandLineArg === '--organizationId'
  );
  if (organizationIdIndicatorIndex === -1 || organizationIdIndicatorIndex + 1 >= commandLineArgsLength) {
    throw new Error("ID de l'organisation obligatoire.");
  }
  const organizationId = parseInt(commandLineArgs[organizationIdIndicatorIndex + 1]);
  if (isNaN(organizationId)) {
    throw new Error(
      `ID de l'organisation fourni ${commandLineArgs[organizationIdIndicatorIndex + 1]} n'est pas un entier.`
    );
  }
  return organizationId;
}

function _validateAndNormalizeTargetProfileId(commandLineArgs) {
  const commandLineArgsLength = commandLineArgs.length;
  const targetProfileIdIndicatorIndex = commandLineArgs.findIndex(
    (commandLineArg) => commandLineArg === '--targetProfileId'
  );
  if (targetProfileIdIndicatorIndex === -1 || targetProfileIdIndicatorIndex + 1 >= commandLineArgsLength) {
    return null;
  }
  const targetProfileId = parseInt(commandLineArgs[targetProfileIdIndicatorIndex + 1]);
  if (isNaN(targetProfileId)) {
    throw new Error(
      `ID du profil cible fourni ${commandLineArgs[targetProfileIdIndicatorIndex + 1]} n'est pas un entier.`
    );
  }
  return targetProfileId;
}

function _validateAndNormalizeParticipantCount(commandLineArgs) {
  const commandLineArgsLength = commandLineArgs.length;
  const participantCountIndicatorIndex = commandLineArgs.findIndex(
    (commandLineArg) => commandLineArg === '--participantCount'
  );
  if (participantCountIndicatorIndex === -1 || participantCountIndicatorIndex + 1 >= commandLineArgsLength) {
    throw new Error('Nombre de participants obligatoire.');
  }
  const participantCount = parseInt(commandLineArgs[participantCountIndicatorIndex + 1]);
  if (isNaN(participantCount)) {
    throw new Error(
      `Nombre de participations fourni ${commandLineArgs[participantCountIndicatorIndex + 1]} n'est pas un entier.`
    );
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
    throw new Error(
      `Type de profil doit être une valeur parmi light, medium et all, ${
        commandLineArgs[profileTypeIndicatorIndex + 1]
      } fourni.`
    );
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
    throw new Error(
      `Type de campagne doit être une valeur parmi assessment et profiles_collection, ${
        commandLineArgs[campaignTypeIndicatorIndex + 1]
      } fourni.`
    );
  }
  return campaignType;
}

function _validateAndNormalizeArgs(commandLineArgs) {
  if (commandLineArgs.find((commandLineArg) => commandLineArg === '--help' || commandLineArg === '-h')) {
    _printUsage();
    throw new Error('Invalid usage');
  }
  if (commandLineArgs.find((commandLineArg) => commandLineArg === '--lowRAM')) {
    lowRAMMode = true;
  }
  const campaignType = _validateAndNormalizeCampaignType(commandLineArgs);
  const targetProfileId = _validateAndNormalizeTargetProfileId(commandLineArgs);
  return {
    organizationId: _validateAndNormalizeOrganizationId(commandLineArgs),
    targetProfileId: _validateAndNormalizeTargetProfileId(commandLineArgs),
    participantCount: _validateAndNormalizeParticipantCount(commandLineArgs),
    profileType:
      campaignType === 'ASSESSMENT' && !targetProfileId ? _validateAndNormalizeProfileType(commandLineArgs) : 'all',
    campaignType,
  };
}

async function _createTargetProfile({ profileType }) {
  _log('Création du profil cible...');
  const competences = await competenceRepository.listPixCompetencesOnly();
  const competencesInProfile =
    profileType === 'light'
      ? [_.sample(competences)]
      : profileType === 'medium'
      ? _.sampleSize(competences, Math.round(competences.length / 2))
      : competences;
  const [{ id: targetProfileId }] = await knex('target-profiles').returning('id').insert({ name: 'SomeTargetProfile' });
  for (const competence of competencesInProfile) {
    const skills = await skillRepository.findOperativeByCompetenceId(competence.id);
    for (const skill of skills) {
      await knex('target-profiles_skills').insert({ targetProfileId, skillId: skill.id });
    }
  }

  const targetProfile = await targetProfileRepository.get(targetProfileId);
  _log('OK');
  return targetProfile;
}

async function _getTargetProfile(targetProfileId) {
  _log('Récupération du profil cible existant...');
  const targetProfile = await targetProfileRepository.get(targetProfileId);
  _log('OK');
  return targetProfile;
}

async function _createCampaign({ organizationId, campaignType, targetProfileId }) {
  const doesOrganizationExist = await knex('organizations').where({ id: organizationId }).first();
  if (!doesOrganizationExist) {
    throw new Error(`Organisation ${organizationId} n'existe pas.`);
  }
  const { userId: adminMemberId } = await knex
    .select('userId')
    .from('memberships')
    .where({ organizationId, organizationRole: 'ADMIN' })
    .first();
  if (!adminMemberId) {
    throw new Error(`Organisation ${organizationId} n'a pas de membre ADMIN.`);
  }
  const code = await generate(campaignRepository);
  const [{ id: campaignId }] = await knex('campaigns')
    .returning('id')
    .insert({
      name: `Campaign_${organizationId}_${targetProfileId}`,
      code,
      ownerId: 1,
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
    });
  }
  const chunkSize = _getChunkSize(userData[0]);
  const users = await trx.batchInsert('users', userData.flat(), chunkSize).returning('id');
  return users.map((user) => user.id);
}

async function _createOrganizationLearners({ userIds, organizationId, uniqId, trx }) {
  const { type } = await trx.select('type').from('organizations').where({ id: organizationId }).first();
  let organizationLearnerSpecificBuilder;
  switch (type) {
    case 'SCO':
      organizationLearnerSpecificBuilder = _buildSCOOrganizationLearner;
      break;
    case 'SUP': {
      organizationLearnerSpecificBuilder = _buildSUPOrganizationLearner;
      break;
    }
    case 'PRO': {
      organizationLearnerSpecificBuilder = _buildPROOrganizationLearner;
      break;
    }
    default:
      throw new Error(`L'organisation d'id ${organizationId} présente le type inconnu : ${type}`);
  }
  const organizationLearnerData = [];
  for (const userId of userIds) {
    const identifier = _getIdentifier(uniqId);
    organizationLearnerData.push(organizationLearnerSpecificBuilder({ userId, organizationId, identifier }));
  }
  const chunkSize = _getChunkSize(organizationLearnerData[0]);
  return trx
    .batchInsert('organization-learners', organizationLearnerData.flat(), chunkSize)
    .returning(['id', 'userId']);
}

function _buildBaseOrganizationLearner({ userId, organizationId, identifier }) {
  const birthdates = ['2001-01-05', '2002-11-15', '1995-06-25'];
  return {
    organizationId,
    userId,
    firstName: `firstName${identifier}`,
    lastName: `lastName${identifier}`,
    preferredLastName: `preferredLastName${identifier}`,
    middleName: `middleName${identifier}`,
    thirdName: `thirdName${identifier}`,
    birthdate: birthdates[_.random(0, 2)],
    birthCity: `birthCity${identifier}`,
    birthCityCode: `birthCityCode${identifier}`,
    birthCountryCode: `birthCountryCode${identifier}`,
    birthProvinceCode: `birthProvinceCode${identifier}`,
  };
}

function _buildSCOOrganizationLearner({ userId, organizationId, identifier }) {
  const divisions = ['3eme', '4eme', '5eme', '6eme'];
  return {
    ..._buildBaseOrganizationLearner({ userId, organizationId, identifier }),
    status: 'ST',
    nationalStudentId: `INE_${organizationId}_${identifier}`,
    division: divisions[_.random(0, 3)],
  };
}

function _buildSUPOrganizationLearner({ userId, organizationId, identifier }) {
  const diplomas = ['LICENCE', 'MASTER', 'DOCTORAT', 'DUT'];
  const groups = ['G1', 'G2', 'G3', 'G4'];
  return {
    ..._buildBaseOrganizationLearner({ userId, organizationId, identifier }),
    studentNumber: `NUMETU_${organizationId}_${identifier}`,
    diploma: diplomas[_.random(0, 3)],
    group: groups[_.random(0, 3)],
  };
}

function _buildPROOrganizationLearner({ userId, organizationId, identifier }) {
  return _buildBaseOrganizationLearner({ userId, organizationId, identifier });
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

async function _createCampaignParticipations({ campaignId, trx, organizationLearnerAndUserIds }) {
  const participationData = [];
  for (const organizationLearnerAndUserId of organizationLearnerAndUserIds) {
    const createdAt = moment(baseDate).add(_.random(0, 100), 'days').toDate();
    const isShared = Boolean(_.random(0, 1));
    const sharedAt = isShared ? moment(createdAt).add(_.random(1, 10), 'days').toDate() : null;
    const userId = organizationLearnerAndUserId.userId;
    const organizationLearnerId = organizationLearnerAndUserId.id;

    participationData.push({
      campaignId,
      createdAt,
      status: isShared ? SHARED : TO_SHARE,
      sharedAt,
      userId,
      organizationLearnerId,
    });
  }
  const chunkSize = _getChunkSize(participationData[0]);
  return trx.batchInsert('campaign-participations', participationData.flat(), chunkSize).returning(['id', 'userId']);
}

async function _createAnswersAndKnowledgeElements({ campaignId, targetProfile, userAndAssessmentIds, trx }) {
  _log('\tCréation des answers de référence...');
  const answerData = [];
  for (const userAndAssessmentId of userAndAssessmentIds) {
    answerData.push({
      value: 'someValue',
      assessmentId: userAndAssessmentId.id,
      challengeId: 'someChallengeId',
    });
  }
  const chunkSize = _getChunkSize(answerData[0]);
  const answerRecordedData = await trx
    .batchInsert('answers', answerData.flat(), chunkSize)
    .returning(['id', 'assessmentId']);
  _log('\tOK');

  _log('\tCréation des knowledge-elements...');
  const knowledgeElementData = [];
  _log('\t\tCréation des données par acquis...');
  const skills = await campaignRepository.findSkills({ campaignId });
  for (const skill of skills) {
    const knowledgeElementDataForOneSkill = [];
    for (const userAndAssessmentId of userAndAssessmentIds) {
      const status = Math.random() < 0.7 ? 'validated' : 'invalidated';
      const referenceAnswer = answerRecordedData.find((answerRecordedItem) => {
        return answerRecordedItem.assessmentId === userAndAssessmentId.id;
      });
      const knowledgeElementProps = {
        source: 'direct',
        status,
        assessmentId: referenceAnswer.assessmentId,
        skillId: skill.id,
        earnedPix: status === 'validated' ? skill.pixValue : 0,
        userId: userAndAssessmentIds.find(
          (userAndAssessmentId) => userAndAssessmentId.id === referenceAnswer.assessmentId
        ).userId,
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
  _log('\t\tOK');

  _log('\t\tInsertion en base de données...');
  const chunkedKnowledgeElements = _.chunk(knowledgeElementData.flat(), _getChunkSize(knowledgeElementData[0]?.[0]));
  let totalKeCount = 0;
  for (const chunk of chunkedKnowledgeElements) {
    await trx('knowledge-elements').insert(chunk);
    totalKeCount = totalKeCount + chunk.length;
    _logProgression(chunkedKnowledgeElements.length);
  }
  _log('\t\tOK');
  _log(`\t${totalKeCount} knowledge-elements créés`);
  _log('\tOK');
}

async function _createBadgeAcquisitions({ targetProfile, userAndCampaignParticipationIds, trx }) {
  const badges = await trx.select('id').from('badges').where({ targetProfileId: targetProfile.id });
  const badgeIds = _.map(badges, 'id');
  if (badgeIds.length === 0) {
    _log(`\tAucun badge pour le profil cible ${targetProfile.id} - ${targetProfile.name}`);
    return;
  }
  const badgeAcquisitionData = [];
  for (const userAndCampaignParticipationId of userAndCampaignParticipationIds) {
    for (const badgeId of badgeIds) {
      const haveBadge = _.random(0, 1) === 1;
      if (haveBadge) {
        badgeAcquisitionData.push({
          userId: userAndCampaignParticipationId.userId,
          badgeId,
        });
      }
    }
  }
  const chunkSize = _getChunkSize(badgeAcquisitionData[0]);
  await trx.batchInsert('badge-acquisitions', badgeAcquisitionData.flat(), chunkSize);
  _log(`\t${badgeAcquisitionData.flat().length} acquisitions de badge créées`);
}

async function _createParticipants({ count, targetProfile, organizationId, campaignId, trx }) {
  _log('Création des utilisateurs...');
  const userIds = await _createUsers({ count, uniqId: targetProfile.id, trx });
  _log('OK');

  _log('Création des organization-learners...');
  const organizationLearnerAndUserIds = await _createOrganizationLearners({
    userIds,
    organizationId,
    uniqId: targetProfile.id,
    trx,
  });
  _log('OK');

  _log('Création des campaign-participations...');
  const userAndCampaignParticipationIds = await _createCampaignParticipations({
    campaignId,
    organizationLearnerAndUserIds,
    trx,
  });
  _log('OK');
  _log('Création des assessments...');
  const userAndAssessmentIds = await _createAssessments({ userAndCampaignParticipationIds, trx });
  _log('OK');
  _log('Création des answers/knowledge-elements...');
  await _createAnswersAndKnowledgeElements({ campaignId, targetProfile, userAndAssessmentIds, trx });
  _log('OK');
  _log('Création des obtentions de badge...');
  await _createBadgeAcquisitions({ targetProfile, userAndCampaignParticipationIds, trx });
  _log('OK');
}

async function generateCampaignWithParticipants({
  organizationId,
  targetProfileId,
  participantCount,
  profileType,
  campaignType,
}) {
  const targetProfile = targetProfileId
    ? await _getTargetProfile(targetProfileId)
    : await _createTargetProfile({ profileType });
  _log('Création de la campagne...');
  const campaignId = await _createCampaign({ organizationId, campaignType, targetProfileId: targetProfile.id });
  _log('OK');
  const trx = await knex.transaction();
  if (lowRAMMode) {
    _log("Mode lowRAM activé. Découpage de l'opération en plusieurs paquets de 150 participants.");
    let participantLeftToProcess = participantCount;
    const PARTICIPANT_CHUNK_SIZE = 500;
    while (participantLeftToProcess > 0) {
      _log(`Reste à traiter : ${participantLeftToProcess} participants`);
      const count =
        participantLeftToProcess > PARTICIPANT_CHUNK_SIZE ? PARTICIPANT_CHUNK_SIZE : participantLeftToProcess;

      participantLeftToProcess = participantLeftToProcess - PARTICIPANT_CHUNK_SIZE;
      await _createParticipants({ count, targetProfile, organizationId, campaignId, trx });
    }
  } else {
    await _createParticipants({ count: participantCount, targetProfile, organizationId, campaignId, trx });
  }
  await trx.commit();
  _log('génération des snapshots KE ...');
  const campaignParticipationData = await getEligibleCampaignParticipations(participantCount);
  await generateKnowledgeElementSnapshots(campaignParticipationData, 3);
  _log('pré-calcul des résultats ...');
  await computeParticipationResults();
  _log(
    `Campagne: ${campaignId}\nOrganisation: ${organizationId}\nNombre de participants: ${participantCount}\nProfil Cible: ${targetProfile.id}`
  );
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  const commandLineArgs = process.argv.slice(2);
  _log('Validation des arguments...');
  const { organizationId, targetProfileId, participantCount, profileType, campaignType } =
    _validateAndNormalizeArgs(commandLineArgs);

  _log('OK');
  await generateCampaignWithParticipants({
    organizationId,
    targetProfileId,
    participantCount,
    profileType,
    campaignType,
  });
  _log('FIN');
}

(async () => {
  if (isLaunchedFromCommandLine) {
    LOG_ENABLE = true;
    try {
      await main();
    } catch (error) {
      console.error(error);
      _printUsage();
      process.exitCode = 1;
    } finally {
      await disconnect();
      cache.quit();
    }
  }
})();

module.exports = { generateCampaignWithParticipants };
