const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const { UserNotAuthorizedToGetCampaignResultsError, CampaignTypeError } = require('../errors');
const CampaignProfilesCollectionExport = require('../../infrastructure/serializers/csv/campaign-profiles-collection-export');

async function _checkCreatorHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(
      `User does not have an access to the organization ${organizationId}`
    );
  }
}

module.exports = async function startWritingCampaignProfilesCollectionResultsToStream({
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

  if (!campaign.isProfilesCollection()) {
    throw new CampaignTypeError();
  }

  const [allPixCompetences, organization, campaignParticipationResultDatas] = await Promise.all([
    competenceRepository.listPixCompetencesOnly({ locale: i18n.getLocale() }),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findProfilesCollectionResultDataByCampaignId(campaign.id),
  ]);

  const campaignProfilesCollectionExport = new CampaignProfilesCollectionExport(
    writableStream,
    organization,
    campaign,
    allPixCompetences,
    translate
  );

  // No return/await here, we need the writing to continue in the background
  // after this function's returned promise resolves. If we await the map
  // function, node will keep all the data in memory until the end of the
  // complete operation.
  campaignProfilesCollectionExport
    .export(campaignParticipationResultDatas, placementProfileService)
    .then(() => {
      writableStream.end();
    })
    .catch((error) => {
      writableStream.emit('error', error);
      throw error;
    });

  const fileName = translate('campaign-export.common.file-name', {
    name: campaign.name,
    id: campaign.id,
    date: dayjs().tz('Europe/Berlin').format('YYYY-MM-DD-HHmm'),
  });

  return { fileName };
};
