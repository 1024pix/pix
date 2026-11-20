import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { PromiseUtils } from '../../../shared/infrastructure/utils/promise-utils.js';
import { LtiLineItemsInitializationError, LtiScoreSendingError } from '../errors.js';

const logger = child('lti:scoring-service', { event: SCOPES.LTI });

const LINE_ITEM_CONTENT_TYPE = 'application/vnd.ims.lis.v2.lineitem+json';
const LINE_ITEM_CONTAINER_CONTENT_TYPE = 'application/vnd.ims.lis.v2.lineitemcontainer+json';
const SCORE_CONTENT_TYPE = 'application/vnd.ims.lis.v1.score+json';
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
 * @typedef {object} LineItemScore
 * @property {string} resourceId resource id of the line item the score is for
 * @property {number} scoreGiven
 * @property {number} scoreMaximum
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

    const existingLineItems = await listLineItems({ lineItemsUrl, resourceLinkId, tag, headers }, dependencies);
    if (!existingLineItems) {
      throw new LtiLineItemsInitializationError('Could not list line items');
    }
    const existingResourceIds = new Set(existingLineItems.map(({ resourceId }) => resourceId));

    const missingLineItems = lineItems.filter(({ resourceId }) => !existingResourceIds.has(resourceId));

    if (missingLineItems.length > 0) {
      await createLineItems({ lineItemsUrl, lineItems: missingLineItems, headers }, dependencies);
    }
  },

  /**
   * Publishes the scores of a user on the matching line items of the platform (AGS score service).
   * Line items are looked up on the platform (by tag and resource link, then by resourceId):
   * a score whose line item does not exist on the platform is skipped.
   * Scores are sent as final: the activity is completed and fully graded.
   *
   * @param {object} args
   * @param {string} args.lineItemsUrl AGS line items container URL
   * @param {string} args.resourceLinkId LTI resource link id the line items are attached to
   * @param {string} args.tag tag shared by the line items, used to find them on the platform
   * @param {string} args.ltiUserId LTI user id on the platform (`sub` claim of the launch)
   * @param {Array<LineItemScore>} args.scores
   * @param {Date} args.timestamp date of the scores, scores older than the last one received are ignored by the platform
   * @param {AccessToken} args.accessToken AGS access token, scoped for line items and scores
   * @param {object} dependencies
   * @throws {LtiScoreSendingError}
   */
  async sendScores(
    { lineItemsUrl, resourceLinkId, tag, ltiUserId, scores, timestamp, accessToken },
    dependencies = { httpAgent },
  ) {
    if (!lineItemsUrl) {
      throw new LtiScoreSendingError('Missing line items URL');
    }

    const headers = buildAuthorizationHeader(accessToken);

    const lineItems = await listLineItems({ lineItemsUrl, resourceLinkId, tag, headers }, dependencies);
    if (!lineItems) {
      throw new LtiScoreSendingError('Could not list line items');
    }
    const lineItemUrls = new Map(lineItems.map(({ id, resourceId }) => [resourceId, id]));

    await PromiseUtils.mapSeries(scores, async ({ resourceId, scoreGiven, scoreMaximum }) => {
      const lineItemUrl = lineItemUrls.get(resourceId);
      if (!lineItemUrl) {
        logger.warn({ lineItemsUrl, resourceId }, 'line item not found on the platform, score not sent');
        return;
      }

      await sendScore(
        { lineItemUrl, headers, score: { userId: ltiUserId, scoreGiven, scoreMaximum, timestamp } },
        dependencies,
      );
    });
  },
};

/** @returns {Promise<Array<{ id: string, resourceId: string }>|null>} null when the line items could not be listed */
async function listLineItems({ lineItemsUrl, resourceLinkId, tag, headers }, dependencies) {
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
    return null;
  }

  return response.data;
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

async function sendScore({ lineItemUrl, headers, score }, dependencies) {
  const response = await dependencies.httpAgent.post({
    url: buildScoresUrl(lineItemUrl),
    payload: {
      userId: score.userId,
      scoreGiven: score.scoreGiven,
      scoreMaximum: score.scoreMaximum,
      activityProgress: 'Completed',
      gradingProgress: 'FullyGraded',
      timestamp: score.timestamp.toISOString(),
    },
    headers: { ...headers, 'Content-Type': SCORE_CONTENT_TYPE },
  });

  if (!response.isSuccessful) {
    logger.error({ lineItemUrl, code: response.code }, 'could not send score');
    throw new LtiScoreSendingError('Could not send score');
  }
}

// The scores endpoint is the line item URL path suffixed by `/scores`, query string preserved
function buildScoresUrl(lineItemUrl) {
  const url = new URL(lineItemUrl);
  url.pathname = `${url.pathname.replace(/\/$/, '')}/scores`;
  return url.toString();
}

function buildAuthorizationHeader(accessToken) {
  return { Authorization: `${accessToken.token_type} ${accessToken.access_token}` };
}
