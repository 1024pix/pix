const csvUtils = require('../../infrastructure/utils/csv-utils');
const CampaignIndividualResult = require('../models/CampaignIndividualResult');
const bluebird = require('bluebird');
const _ = require('lodash');

const {
  UserNotAuthorizedToGetCampaignResultsError,
  CampaignWithoutOrganizationError
} = require('../errors');

async function _ensureUserHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    throw new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`);
  }
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(`User does not have an access to the organization ${organizationId}`);
  }
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
  campaignCsvResultService,
}) {

  const {
    CAMPAIGN_CSV_PLACEHOLDER: placeholder,
    makeCSVResultFileName,
    createCsvHeader,
    getHeaderPropertyMap,
    getHeaderPropertyMapWhenShared,
  } = campaignCsvResultService;

  const campaign = await campaignRepository.get(campaignId);

  const [targetProfile, competences, organization, campaignParticipations] = await Promise.all([
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findByCampaignId(campaign.id),
    _ensureUserHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository),
  ]);

  const campaignIndividualResult = CampaignIndividualResult.buildFrom({
    campaign, targetProfile, competences, organization,
  });

  const headers = createCsvHeader(campaign, campaignIndividualResult.targeted);
  writableStream.write(csvUtils.getHeadersLine(headers));

  bluebird.mapSeries(campaignParticipations, async (campaignParticipation) => {

    const [assessment, user, allKnowledgeElements] = await _fetchIndividualDatas({ campaignParticipation,
      userRepository, smartPlacementAssessmentRepository, knowledgeElementRepository });

    // CSV lines are very different whether the participant has shared its campaign or not
    // When the campaign is shared, we can display *a lot* more informations about his results.
    let line;
    if (!campaignParticipation.isShared) {
      campaignIndividualResult.addIndividualStatistics({ assessment, user, campaignParticipation, allKnowledgeElements });
      line = csvUtils.getCsvLine({
        rawData: campaignIndividualResult,
        headerPropertyMap: getHeaderPropertyMap(campaign),
        placeholder,
        headers,
      });

    } else {
      campaignIndividualResult.addIndividualStatisticsWhenShared({ assessment, user, campaignParticipation, allKnowledgeElements });
      line = csvUtils.getCsvLine({
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

  return { fileName: makeCSVResultFileName(campaign) };
};

function _fetchIndividualDatas({ campaignParticipation, userRepository, smartPlacementAssessmentRepository, knowledgeElementRepository }) {
  return Promise.all([
    smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId),
    userRepository.get(campaignParticipation.userId),
    knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt })
  ]);
}
