const moment = require('moment');
const { UserNotAuthorizedToGetCampaignResultsError } = require('../errors');
const CampaignProfilCollectionExport = require('../../infrastructure/serializers/csv/campaign-profile-collection-export');

async function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(
      `User does not have an access to the organization ${organizationId}`,
    );
  }
}

module.exports = async function startWritingCampaignProfilesCollectionResultsToStream(
  {
    userId,
    campaignId,
    writableStream,
    i18n,
    campaignRepository,
    userRepository,
    competenceRepository,
    campaignParticipationRepository,
    organizationRepository,
    placementProfileService,
  }) {

  const campaign = await campaignRepository.get(campaignId);
  const translate = i18n.__;

  await _checkCreatorHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository);

  const [allPixCompetences, organization, campaignParticipationResultDatas] = await Promise.all([
    competenceRepository.listPixCompetencesOnly(i18n.getLocale()),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id, campaign.type),
  ]);

  const campaignProfilCollectionExport = new CampaignProfilCollectionExport(writableStream, organization, campaign, allPixCompetences, translate);

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the map
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  campaignProfilCollectionExport.export(campaignParticipationResultDatas, placementProfileService).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  const fileName = translate('campaign.profiles-collection.file-name', { name: campaign.name, id: campaign.id, date: moment.utc().format('YYYY-MM-DD-hhmm') });

  return { fileName };
};
