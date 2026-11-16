/**
 * @typedef {import ('./index.js').SessionForResultsSharingRepository} SessionForResultsSharingRepository
 */

import { NoCertificationResultsToDownloadError } from '../errors.js';

/**
 * @param {object} params
 * @param {Array<number>} params.sessionIds
 * @param {SessionForResultsSharingRepository} params.sessionForResultsSharingRepository
 * @returns {Promise<Array<number>>} the given session ids that are published, in the given order
 */
export async function filterPublishedSessionIds({ sessionIds, sessionForResultsSharingRepository }) {
  const publishedSessionIds = await sessionForResultsSharingRepository.findPublishedSessionIds({ sessionIds });

  if (!publishedSessionIds.length) {
    throw new NoCertificationResultsToDownloadError();
  }

  return sessionIds.filter((sessionId) => publishedSessionIds.includes(sessionId));
}
