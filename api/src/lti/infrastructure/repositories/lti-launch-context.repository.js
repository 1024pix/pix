/**
 * @typedef {object} LtiLaunchContext
 * @property {import('../../domain/models/LtiPlatformRegistration.js').LtiPlatformRegistration} registration registration of the platform the campaign was launched from, with its platform OpenID configuration fetched
 * @property {string} lineItemsUrl AGS line items container URL received at launch
 * @property {string} resourceLinkId LTI resource link id received at launch
 * @property {string} ltiUserId LTI user id on the platform (`sub` claim of the launch)
 */
export const ltiLaunchContextRepository = {
  /**
   * TODO: the LTI launch context is not stored yet, it must be persisted during the LTI launch.
   * Until then, no participation is considered as launched through LTI.
   *
   * @returns {Promise<LtiLaunchContext|null>} null when the user did not launch the campaign through LTI
   */
  async findByCampaignIdAndUserId() {
    return null;
  },
};
