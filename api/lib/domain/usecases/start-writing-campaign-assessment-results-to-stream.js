const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');
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
    campaignParticipationRepository,
    organizationRepository,
    knowledgeElementRepository,
    campaignCsvExportService,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const [targetProfile, allCompetences, organization, campaignParticipationResultDatas] = await Promise.all([
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findAssessmentResultDataByCampaignId(campaign.id),
  ]);

  const competences = _extractCompetences(allCompetences, targetProfile.skills);

  //Create HEADER of CSV
  const headers = _createHeaderOfCSV(targetProfile.skills, competences, campaign.idPixLabel);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvSerializer.serializeLine(headers);

  writableStream.write(headerLine);

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the mapSeries
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  bluebird.mapSeries(campaignParticipationResultDatas, async (campaignParticipationResultData) => {
    const participantKnowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId: campaignParticipationResultData.userId,
      limitDate: campaignParticipationResultData.sharedAt,
    });

    const csvLine = campaignCsvExportService.createOneCsvLine({
      organization,
      campaign,
      competences,
      campaignParticipationResultData,
      targetProfile,
      participantKnowledgeElements,
    });

    writableStream.write(csvLine);
  }).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  const fileName = `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
  return { fileName };
};

async function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    throw new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`);
  }

  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(
      `User does not have an access to the organization ${organizationId}`
    );
  }
}

function _createHeaderOfCSV(skills, competences, idPixLabel) {
  const areas = _extractAreas(competences);

  return [
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',

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

    ...(_.map(skills, 'name')),
  ];
}

function _extractCompetences(allCompetences, skills) {
  return _(skills)
    .map('competenceId')
    .uniq()
    .map((competenceId) => {
      const competence = _.find(allCompetences, { id: competenceId });
      if (!competence) {
        throw new Error(`Unknown competence ${competenceId}`);
      }
      return competence;
    })
    .value();
}

function _extractAreas(competences) {
  return _.uniqBy(competences.map((competence) => competence.area), 'code');
}

