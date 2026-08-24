import * as eventApi from '../../../shared/application/api/event-api.js';
import { EVENT_NAMES } from '../../../shared/domain/constants/event-names.js';

/**
 @typedef {import ('../../domain/models/Candidate.js').Candidate} Candidate
 */

/**
 * @param {object} params
 * @param {number} params.candidateId
 * @param {Date} params.authorizedToStartAt
 */
export async function onCandidateAuthorizedToStart({ candidateId, authorizedToStartAt, dependencies = { eventApi } }) {
  await pushEvent({ candidateId, authorizedToStartAt, name: EVENT_NAMES.CANDIDATE_AUTHORIZED_TO_START, dependencies });
}

/**
 * @param {object} params
 * @param {number} params.candidateId
 * @param {Date} params.authorizedToStartAt
 */
export async function onCandidateAuthorizedToResume({ candidateId, authorizedToStartAt, dependencies = { eventApi } }) {
  await pushEvent({ candidateId, authorizedToStartAt, name: EVENT_NAMES.CANDIDATE_AUTHORIZED_TO_RESUME, dependencies });
}

/**
 * @param {object} params
 * @param {number} params.candidateId
 */
export async function onCandidateUnauthorizedToStart({ candidateId, dependencies = { eventApi } }) {
  await pushEvent({
    candidateId,
    authorizedToStartAt: null,
    name: EVENT_NAMES.CANDIDATE_UNAUTHORIZED_TO_START,
    dependencies,
  });
}

/**
 *
 * @param {object} params
 * @param {number} params.candidateId
 * @param {Date} params.authorizedToStartAt
 * @param {typeof EVENT_NAMES[keyof typeof EVENT_NAMES]} params.name
 */
async function pushEvent({ candidateId, authorizedToStartAt, name, dependencies = { eventApi } }) {
  await dependencies.eventApi.pushEvents([
    {
      name,
      candidateId,
      createdAt: new Date(),
      metadata: {
        id: candidateId,
        authorizedToStartAt,
      },
    },
  ]);
}
