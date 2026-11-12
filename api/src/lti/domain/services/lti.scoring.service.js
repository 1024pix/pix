import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { getI18n } from '../../../shared/infrastructure/i18n/i18n.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import { LtiLineItemsInitializationError } from '../errors.js';

const logger = child('lti:scoring-service', { event: SCOPES.LTI });

const LINE_ITEM_CONTENT_TYPE = 'application/vnd.ims.lis.v2.lineitem+json';
const LINE_ITEMS_LOCALE = 'fr';
const LINE_ITEMS_QUERY_LIMIT = 1000;

export const ltiScoringService = {
  /**
   * Creates on the platform the line items matching the campaign, skipping those that already exist.
   * Existing line items are looked up on the platform (by tag, then by resourceId), so calling this
   * method several times for the same campaign never creates duplicates.
   *
   * @param {object} args
   * @param {string} args.lineItemsUrl AGS line items container URL
   * @param {string} args.resourceLinkId LTI resource link id
   * @param {object} dependencies
   * @param {import('../models/LtiCampaign.js').LtiCampaign} args.campaign
   * @param {{ token_type: string, access_token: string }} args.accessToken AGS access token, scoped for line items
   * @throws {LtiLineItemsInitializationError}
   */
  async initializeLineItems(
    { lineItemsUrl, resourceLinkId, campaign, accessToken },
    dependencies = { getI18n, httpAgent },
  ) {
    if (!lineItemsUrl) {
      throw new LtiLineItemsInitializationError('Missing line items URL');
    }

    const headers = { Authorization: `${accessToken.token_type} ${accessToken.access_token}` };

    const existingResourceIds = await findExistingResourceIds(
      { lineItemsUrl, tag: campaign.lineItemTag, resourceLinkId, headers },
      dependencies,
    );

    const expectedLineItems = campaign.buildLineItems(resourceLinkId, dependencies.getI18n(LINE_ITEMS_LOCALE));
    const missingLineItems = expectedLineItems.filter(({ resourceId }) => !existingResourceIds.has(resourceId));

    if (missingLineItems.length > 0) {
      await createLineItems({ missingLineItems, httpAgent: dependencies.httpAgent, lineItemsUrl, headers });
    }
  },
};

async function findExistingResourceIds({ lineItemsUrl, tag, headers, resourceLinkId }, dependencies) {
  const url = new URL(lineItemsUrl);
  url.searchParams.set('tag', tag);
  url.searchParams.set('resourceLinkId', resourceLinkId);
  url.searchParams.set('limit', String(LINE_ITEMS_QUERY_LIMIT));

  const response = await dependencies.httpAgent.get({
    url: url.toString(),
    headers: { ...headers, Accept: 'application/vnd.ims.lis.v2.lineitemcontainer+json' },
  });

  if (!response.isSuccessful || !Array.isArray(response.data)) {
    logger.error({ lineItemsUrl, code: response.code }, 'could not list line items');
    throw new LtiLineItemsInitializationError('Could not list line items');
  }

  return new Set(response.data.map(({ resourceId }) => resourceId));
}

async function createLineItems({ missingLineItems, httpAgent, lineItemsUrl, headers }) {
  await PromiseUtils.mapSeries(missingLineItems, async (lineItem) => {
    const response = await httpAgent.post({
      url: lineItemsUrl,
      payload: lineItem,
      headers: { ...headers, 'Content-Type': LINE_ITEM_CONTENT_TYPE },
    });
    if (!response.isSuccessful) {
      logger.error(
        { lineItemsUrl, resourceId: lineItem.resourceId, code: response.code },
        'could not create line item',
      );
      throw new LtiLineItemsInitializationError('Could not create line item');
    }
  });
}
