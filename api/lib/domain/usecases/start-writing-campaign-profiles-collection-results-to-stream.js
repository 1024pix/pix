const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');

const constants = require('../../infrastructure/constants');
const { UserNotAuthorizedToGetCampaignResultsError } = require('../errors');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');

async function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(
      `User does not have an access to the organization ${organizationId}`,
    );
  }
}

function _createHeaderOfCSV(competences, idPixLabel, organization) {
  const EMPTY_ARRAY = [];
  const displayStudentNumber = organization.isSup && organization.isManagingStudents;
  return [
    { title: 'Nom de l\'organisation', property: 'organizationName' },
    { title: 'ID Campagne', property: 'campaignId' },
    { title: 'Nom de la campagne', property: 'campaignName' },
    { title: 'Nom du Participant', property: 'participantLastName' },
    { title: 'Prénom du Participant', property: 'participantFirstName' },

    ...(displayStudentNumber ? [{ title: 'Numéro Étudiant', property: 'studentNumber' }] : EMPTY_ARRAY),

    ...(idPixLabel ? [ { title: idPixLabel, property: 'participantExternalId' } ] : EMPTY_ARRAY),

    { title: 'Envoi (O/N)', property: 'isShared' },
    { title: 'Date de l\'envoi', property: 'sharedAt' },
    { title: 'Nombre de pix total', property: 'totalEarnedPix' },
    { title: 'Certifiable (O/N)', property: 'isCertifiable' },
    { title: 'Nombre de compétences certifiables', property: 'certifiableCompetencesCount' },

    ...(_.flatMap(competences, (competence) => [
      { title: `Niveau pour la compétence ${competence.name}`, property: `competence_${competence.id}_level` },
      { title: `Nombre de pix pour la compétence ${competence.name}`, property: `competence_${competence.id}_earnedPix` },
    ])),
  ];
}

function _getCommonColumns({
  organization,
  campaign,
  campaignParticipationResultData,

  participantFirstName,
  participantLastName,
  studentNumber,
}) {
  const EMPTY_LINE = '';
  const displayStudentNumber = studentNumber && organization.isSup && organization.isManagingStudents;
  return {
    organizationName: organization.name,
    campaignId: campaign.id,
    campaignName: campaign.name,
    participantLastName,
    participantFirstName,
    studentNumber: displayStudentNumber ? studentNumber : EMPTY_LINE,
    isShared: campaignParticipationResultData.isShared ? 'Oui' : 'Non',
    ...(campaign.idPixLabel ? { participantExternalId: campaignParticipationResultData.participantExternalId } : {}),
  };
}

function _getSharedColumns({
  campaignParticipationResultData,
  placementProfile,
}) {
  const competenceStats = _.map(placementProfile.userCompetences, (userCompetence) => {

    return {
      id: userCompetence.id,
      earnedPix: userCompetence.pixScore,
      level: userCompetence.estimatedLevel,
    };
  });

  const lineMap = {
    sharedAt: moment.utc(campaignParticipationResultData.sharedAt).format('YYYY-MM-DD'),
    totalEarnedPix: _.sumBy(competenceStats, 'earnedPix'),
    isCertifiable: placementProfile.isCertifiable() ? 'Oui' : 'Non',
    certifiableCompetencesCount: placementProfile.getCertifiableCompetencesCount(),
  };

  let totalEarnedPix = 0;
  placementProfile.userCompetences.forEach(({ id, pixScore, estimatedLevel }) => {
    lineMap[`competence_${id}_level`] = estimatedLevel;
    lineMap[`competence_${id}_earnedPix`] = pixScore;
    totalEarnedPix += pixScore;
  });

  lineMap['totalEarnedPix'] = totalEarnedPix;

  return lineMap;
}

function _createOneLineOfCSV({
  headers,
  organization,
  campaign,
  campaignParticipationResultData,
  placementProfile,

  participantFirstName,
  participantLastName,
  studentNumber,
}) {
  const lineMap = _getCommonColumns({
    organization,
    campaign,
    campaignParticipationResultData,

    participantFirstName,
    participantLastName,
    studentNumber,
  });

  if (campaignParticipationResultData.isShared) {
    _.assign(lineMap, _getSharedColumns({
      campaignParticipationResultData,
      placementProfile,
    }));
  }

  const lineArray = headers.map(({ property }) => {
    return property in lineMap ? lineMap[property] : 'NA';
  });

  return csvSerializer.serializeLine(lineArray);
}

module.exports = async function startWritingCampaignProfilesCollectionResultsToStream(
  {
    userId,
    campaignId,
    writableStream,
    campaignRepository,
    userRepository,
    competenceRepository,
    campaignParticipationRepository,
    organizationRepository,
    placementProfileService,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const [allPixCompetences, organization, campaignParticipationResultDatas] = await Promise.all([
    competenceRepository.listPixCompetencesOnly(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id, campaign.type),
  ]);
  const headers = _createHeaderOfCSV(allPixCompetences, campaign.idPixLabel, organization);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvSerializer.serializeLine(headers.map((header) => header.title));

  writableStream.write(headerLine);

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the map
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  const campaignParticipationResultDataChunks = _.chunk(campaignParticipationResultDatas, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);
  bluebird.map(campaignParticipationResultDataChunks, async (campaignParticipationResultDataChunk) => {
    const userIdsAndDates = Object.fromEntries(campaignParticipationResultDataChunk.map((campaignParticipationResultData) => {
      return [
        campaignParticipationResultData.userId,
        campaignParticipationResultData.sharedAt,
      ];
    }));

    const placementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
      userIdsAndDates,
      competences: allPixCompetences,
      allowExcessPixAndLevels: false,
    });

    let csvLines = '';
    for (const placementProfile of placementProfiles) {
      const campaignParticipationResultData = campaignParticipationResultDataChunk.find(({ userId }) =>  userId === placementProfile.userId);
      const csvLine = _createOneLineOfCSV({
        headers,
        organization,
        campaign,
        campaignParticipationResultData,
        placementProfile,
        
        participantFirstName: campaignParticipationResultData.participantFirstName,
        participantLastName: campaignParticipationResultData.participantLastName,
        studentNumber: campaignParticipationResultData.studentNumber,
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
