import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import { LtiLineItemsInitializationError } from '../errors.js';

const logger = child('lti:scoring-service', { event: SCOPES.LTI });

const LINE_ITEM_CONTENT_TYPE = 'application/vnd.ims.lis.v2.lineitem+json';
const LINE_ITEM_CONTAINER_CONTENT_TYPE = 'application/vnd.ims.lis.v2.lineitemcontainer+json';
const LINE_ITEMS_QUERY_LIMIT = 1000;

/**
 * @typedef {object} LineItem
 * @property {string} label
 * @property {string} resourceId
 * @property {number} scoreMaximum
 * @property {string} tag
 * @property {string} resourceLinkId
 */

/**
 * @typedef {{ token_type: string, access_token: string }} AccessToken
 */

export const ltiScoringService = {
  /**
   * Creates on the platform the given line items, skipping those that already exist.
   * Existing line items are looked up on the platform (by tag and resource link, then by resourceId),
   * so calling this method several times with the same line items never creates duplicates.
   *
   * @param {object} args
   * @param {string} args.lineItemsUrl AGS line items container URL
   * @param {string} args.resourceLinkId LTI resource link id the line items are attached to
   * @param {string} args.tag tag shared by the line items, used to find them on the platform
   * @param {Array<LineItem>} args.lineItems expected line items
   * @param {AccessToken} args.accessToken AGS access token, scoped for line items
   * @param {object} dependencies
   * @throws {LtiLineItemsInitializationError}
   */
  async initializeLineItems(
    { lineItemsUrl, resourceLinkId, tag, lineItems, accessToken },
    dependencies = { httpAgent },
  ) {
    if (!lineItemsUrl) {
      throw new LtiLineItemsInitializationError('Missing line items URL');
    }

    const headers = buildAuthorizationHeader(accessToken);

    const existingResourceIds = await findExistingResourceIds(
      { lineItemsUrl, resourceLinkId, tag, headers },
      dependencies,
    );

    const missingLineItems = lineItems.filter(({ resourceId }) => !existingResourceIds.has(resourceId));

    if (missingLineItems.length > 0) {
      await createLineItems({ lineItemsUrl, lineItems: missingLineItems, headers }, dependencies);
    }
  },
};

async function findExistingResourceIds({ lineItemsUrl, resourceLinkId, tag, headers }, dependencies) {
  const url = new URL(lineItemsUrl);
  url.searchParams.set('tag', tag);
  url.searchParams.set('resourceLinkId', resourceLinkId);
  url.searchParams.set('limit', String(LINE_ITEMS_QUERY_LIMIT));

  const response = await dependencies.httpAgent.get({
    url: url.toString(),
    headers: { ...headers, Accept: LINE_ITEM_CONTAINER_CONTENT_TYPE },
  });

  if (!response.isSuccessful || !Array.isArray(response.data)) {
    logger.error({ lineItemsUrl, code: response.code }, 'could not list line items');
    throw new LtiLineItemsInitializationError('Could not list line items');
  }

  return new Set(response.data.map(({ resourceId }) => resourceId));
}

async function createLineItems({ lineItemsUrl, lineItems, headers }, dependencies) {
  await PromiseUtils.mapSeries(lineItems, async (lineItem) => {
    const response = await dependencies.httpAgent.post({
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

function buildAuthorizationHeader(accessToken) {
  return { Authorization: `${accessToken.token_type} ${accessToken.access_token}` };
}
