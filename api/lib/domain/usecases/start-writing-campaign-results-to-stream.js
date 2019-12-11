const CampaignIndividualResult = require('../models/CampaignIndividualResult');
const bluebird = require('bluebird');
const csvService = require('../services/csv-service');
const _ = require('lodash');

const {
  CAMPAIGN_CSV_PLACEHOLDER: placeholder,
  fileName,
  createCsvHeader,
  getHeaderPropertyMap,
  getHeaderPropertyMapWhenShared,
} = require('../services/campaigns/campaign-csv-result-service');

const {
  UserNotAuthorizedToGetCampaignResultsError,
  CampaignWithoutOrganizationError
} = require('../errors');

async function _fetchUserIfHeHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    throw new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`);
  }
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(`User does not have an access to the organization ${organizationId}`);
  }
  return user;
}

module.exports = async function startWritingCampaignResultsToStream({
  userId,
  campaignId,
  writableStream,
  campaignRepository,
  userRepository,
  targetProfileRepository,
  competenceRepository,
  campaignParticipationRepository,
  organizationRepository,
  smartPlacementAssessmentRepository,
  knowledgeElementRepository,
}) {

  const campaign = await campaignRepository.get(campaignId);

  const [user, targetProfile, competences, organization, campaignParticipations] = await Promise.all([
    _fetchUserIfHeHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository),
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findByCampaignId(campaign.id),
  ]);

  const campaignIndividualResult = CampaignIndividualResult.buildFrom({
    campaign, user, targetProfile, competences, organization,
  });

  const headers = createCsvHeader(campaign, campaignIndividualResult.targeted);
  writableStream.write(csvService.getHeaderLine(headers));

  bluebird.mapSeries(campaignParticipations, async (campaignParticipation) => {

    const [assessment, allKnowledgeElements] = await _fetchIndividualDatas({ campaignParticipation, smartPlacementAssessmentRepository, knowledgeElementRepository });

    // CSV lines are very different whether the participant has shared its campaign or not
    // When the campaign is shared, we can display *a lot* more informations about his results.
    let line;
    if (!campaignParticipation.isShared) {
      campaignIndividualResult.addIndividualStatistics({ assessment, campaignParticipation, allKnowledgeElements });
      line = csvService.getCsvLine({
        rawData: campaignIndividualResult,
        headerPropertyMap: getHeaderPropertyMap(campaign),
        placeholder,
        headers,
      });

    } else {
      campaignIndividualResult.addIndividualStatisticsWhenShared({ assessment, campaignParticipation, allKnowledgeElements });
      line = csvService.getCsvLine({
        rawData: campaignIndividualResult,
        headerPropertyMap: getHeaderPropertyMapWhenShared(campaign, campaignIndividualResult.targeted),
        placeholder,
        headers,
      });
    }

    writableStream.write(line);

  }).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  return { fileName: fileName(campaign) };
};

function _fetchIndividualDatas({ campaignParticipation, smartPlacementAssessmentRepository, knowledgeElementRepository }) {
  return Promise.all([
    smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId),
    knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt })
  ]);
}
