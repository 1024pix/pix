const _ = require('lodash');
const fp = require('lodash/fp');
const moment = require('moment');
const bluebird = require('bluebird');

const constants = require('../../infrastructure/constants');
const { UserNotAuthorizedToGetCampaignResultsError } = require('../errors');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');

module.exports = async function startWritingCampaignAssessmentResultsToStream(
  {
    userId,
    campaignId,
    writableStream,
    campaignRepository,
    userRepository,
    targetProfileRepository,
    competenceRepository,
    campaignParticipationInfoRepository,
    organizationRepository,
    knowledgeElementRepository,
    campaignCsvExportService,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const [targetProfile, allCompetences, organization, campaignParticipationInfos] = await Promise.all([
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationInfoRepository.findByCampaignId(campaign.id),
  ]);

  const competences = _extractTargetedCompetences(allCompetences, targetProfile.getCompetenceIds());
  const areas = _extractTargetedAreas(competences);

  // Create HEADER of CSV
  const headers = _createHeaderOfCSV(targetProfile, areas, competences, campaign.idPixLabel, organization.type, organization.isManagingStudents);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvSerializer.serializeLine(headers);

  writableStream.write(headerLine);

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the map
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  const campaignParticipationInfoChunks = _.chunk(campaignParticipationInfos, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
  bluebird.map(campaignParticipationInfoChunks, async (campaignParticipationInfoChunk) => {
    const userIdsAndDates = Object.fromEntries(campaignParticipationInfoChunk.map((campaignParticipationInfo) => {
      return [
        campaignParticipationInfo.userId,
        campaignParticipationInfo.sharedAt,
      ];
    }));
    const knowledgeElementsByUserIdAndCompetenceId =
      await knowledgeElementRepository.findTargetedGroupedByCompetencesForUsers(userIdsAndDates, targetProfile);

    let csvLines = '';
    for (const [strParticipantId, participantKnowledgeElementsByCompetenceId] of Object.entries(knowledgeElementsByUserIdAndCompetenceId)) {
      const participantId = parseInt(strParticipantId);
      const campaignParticipationInfo = campaignParticipationInfoChunk.find((campaignParticipationInfo) => campaignParticipationInfo.userId === participantId);
      const csvLine = campaignCsvExportService.createOneCsvLine({
        organization,
        campaign,
        areas,
        competences,
        campaignParticipationInfo,
        targetProfile,
        participantKnowledgeElementsByCompetenceId,
      });
      csvLines = csvLines.concat(csvLine);
    }

    writableStream.write(csvLines);
  }, { concurrency: constants.CONCURRENCY_HEAVY_OPERATIONS }).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  const fileName = `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
  return { fileName };
};

async function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(
      `User does not have an access to the organization ${organizationId}`,
    );
  }
}

function _createHeaderOfCSV(targetProfile, areas, competences, idPixLabel, organizationType, organizationIsManagingStudents) {
  return [
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',
    ...((organizationType === 'SUP' && organizationIsManagingStudents) ? ['Numéro Étudiant'] : []),

    ...(idPixLabel ? [idPixLabel] : []),

    '% de progression',
    'Date de début',
    'Partage (O/N)',
    'Date du partage',
    '% maitrise de l\'ensemble des acquis du profil',

    ...(_.flatMap(competences, (competence) => [
      `% de maitrise des acquis de la compétence ${competence.name}`,
      `Nombre d'acquis du profil cible dans la compétence ${competence.name}`,
      `Acquis maitrisés dans la compétence ${competence.name}`,
    ])),

    ...(_.flatMap(areas, (area) => [
      `% de maitrise des acquis du domaine ${area.title}`,
      `Nombre d'acquis du profil cible du domaine ${area.title}`,
      `Acquis maitrisés du domaine ${area.title}`,
    ])),

    ...(targetProfile.getSkillNames()),
  ];
}

function _extractTargetedCompetences(allCompetences, targetedCompetenceIds) {
  const _findCompetence = (competenceId) => {
    const competence = _.find(allCompetences, { id: competenceId });
    if (!competence) {
      throw new Error(`Unknown competence ${competenceId}`);
    }
    return competence;
  };

  return fp.flow(
    fp.map(_findCompetence),
    fp.sortBy(['index']),
  )(targetedCompetenceIds);
}

function _extractTargetedAreas(targetedCompetences) {
  return fp.flow(
    fp.map((targetedCompetence) => targetedCompetence.area),
    fp.uniqBy('code'),
  )(targetedCompetences);
}

