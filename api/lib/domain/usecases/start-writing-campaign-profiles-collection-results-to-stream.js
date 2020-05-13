const _ = require('lodash');
const moment = require('moment');
const bluebird = require('bluebird');

const { UserNotAuthorizedToGetCampaignResultsError, CampaignWithoutOrganizationError } = require('../errors');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');

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

function _createHeaderOfCSV(competences, idPixLabel) {
  return [
    { title: 'Nom de l\'organisation', property: 'organizationName' },
    { title: 'ID Campagne', property: 'campaignId' },
    { title: 'Nom de la campagne', property: 'campaignName' },
    { title: 'Nom du Participant', property: 'participantLastName' },
    { title: 'Prénom du Participant', property: 'participantFirstName' },

    ...(idPixLabel ? [ { title: idPixLabel, property: 'participantExternalId' } ] : []),

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
  participantFirstName,
  participantLastName,
  campaignParticipationResultData,
}) {

  return {
    organizationName: organization.name,
    campaignId: campaign.id,
    campaignName: campaign.name,
    participantLastName,
    participantFirstName,
    isShared: campaignParticipationResultData.isShared ? 'Oui' : 'Non',
    ...(campaign.idPixLabel ? { participantExternalId: campaignParticipationResultData.participantExternalId } : {}),
  };
}

function _getSharedColumns({
  campaignParticipationResultData,
  certificationProfile,
}) {
  const competenceStats = _.map(certificationProfile.userCompetences, (userCompetence) => {

    return {
      id: userCompetence.id,
      earnedPix: userCompetence.pixScore,
      level: userCompetence.estimatedLevel,
    };
  });

  const lineMap = {
    sharedAt: moment.utc(campaignParticipationResultData.sharedAt).format('YYYY-MM-DD'),
    totalEarnedPix: _.sumBy(competenceStats, 'earnedPix'),
    isCertifiable: certificationProfile.isCertifiable() ? 'Oui' : 'Non',
    certifiableCompetencesCount: certificationProfile.getCertifiableCompetencesCount(),
  };

  const addStatsColumns = (prefix) => ({ id, earnedPix, level }) => {
    lineMap[`${prefix}_${id}_level`] = level;
    lineMap[`${prefix}_${id}_earnedPix`] = earnedPix;
  };

  _.forEach(competenceStats, addStatsColumns('competence'));

  return lineMap;
}

function _createOneLineOfCSV({
  headers,
  organization,
  campaign,
  campaignParticipationResultData,
  certificationProfile,

  participantFirstName,
  participantLastName,
}) {
  const lineMap = _getCommonColumns({
    organization,
    campaign,
    participantFirstName,
    participantLastName,
    campaignParticipationResultData,
  });

  if (campaignParticipationResultData.isShared) {
    _.assign(lineMap, _getSharedColumns({
      campaignParticipationResultData,
      certificationProfile,
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
    userService,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const [allCompetences, organization, campaignParticipationResultDatas] = await Promise.all([
    competenceRepository.listPixCompetencesOnly(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id, campaign.type),
  ]);
  const headers = _createHeaderOfCSV(allCompetences, campaign.idPixLabel);

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvSerializer.serializeLine(_.map(headers, 'title'));

  writableStream.write(headerLine);

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the mapSeries
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  bluebird.mapSeries(campaignParticipationResultDatas, async (campaignParticipationResultData) => {

    const certificationProfile = await userService.getCertificationProfile({
      userId: campaignParticipationResultData.userId,
      limitDate: campaignParticipationResultData.sharedAt,
      competences: allCompetences,
      limitPixAndLevels: true
    });

    const csvLine = _createOneLineOfCSV({
      headers,
      organization,
      campaign,
      campaignParticipationResultData,
      certificationProfile,

      participantFirstName: campaignParticipationResultData.participantFirstName,
      participantLastName: campaignParticipationResultData.participantLastName,
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
