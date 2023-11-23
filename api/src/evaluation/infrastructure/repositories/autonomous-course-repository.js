import { constants } from '../../../../lib/domain/constants.js';

/**
 * @param {AutonomousCourse} autonomousCourse
 * @param {CampaignApi} campaignApi
 * @returns {Promise<number>} returns the created campaign id
 */
const save = async function ({ autonomousCourse, campaignApi }) {
  const { id } = await campaignApi.save({
    name: autonomousCourse.internalTitle,
    title: autonomousCourse.publicTitle,
    targetProfileId: autonomousCourse.targetProfileId,
    organizationId: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
    creatorId: autonomousCourse.ownerId,
    customLandingPageText: autonomousCourse.customLandingPageText,
  });

  return id;
};

export { save };
