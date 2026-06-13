import * as eventApi from '../../../shared/application/api/event-api.js';
import { EVENT_NAMES } from '../../../shared/domain/constants/event-names.js';

/**
 * @param {object} params
 * @param {Candidate} params.candidate
 */
export async function onCandidateEnrolledIndividually({ candidate, dependencies = { eventApi } }) {
  await pushCandidateEvents({ candidates: [candidate], name: EVENT_NAMES.CANDIDATE_ENROLLED_INDIVIDUAL, dependencies });
}

/**
 * @param {object} params
 * @param {Candidate[]} params.candidates
 */
export async function onCandidatesEnrolledWithImportSheet({ candidates, dependencies = { eventApi } }) {
  await pushCandidateEvents({ candidates, name: EVENT_NAMES.CANDIDATE_ENROLLED_ODS, dependencies });
}

/**
 * @param {object} params
 * @param {Candidate[]} params.candidates
 */
export async function onCandidatesEnrolledWithMassSessionsImport({ candidates, dependencies = { eventApi } }) {
  await pushCandidateEvents({ candidates, name: EVENT_NAMES.CANDIDATE_ENROLLED_CSV, dependencies });
}

/**
 * @param {object} params
 * @param {Candidate[]} params.candidates
 */
export async function onCandidatesEnrolledSco({ candidates, dependencies = { eventApi } }) {
  await pushCandidateEvents({ candidates, name: EVENT_NAMES.CANDIDATE_ENROLLED_SCO, dependencies });
}

/**
 *
 * @param {object} params
 * @param {Candidate[]} params.candidates
 * @param {typeof EVENT_NAMES[keyof typeof EVENT_NAMES]} params.name
 */
async function pushCandidateEvents({ candidates, name, dependencies = { eventApi } }) {
  const toDTO = (candidate) => ({
    id: candidate.id,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    birthCity: candidate.birthCity,
    birthProvinceCode: candidate.birthProvinceCode,
    birthCountry: candidate.birthCountry,
    birthPostalCode: candidate.birthPostalCode,
    birthINSEECode: candidate.birthINSEECode,
    sex: candidate.sex,
    email: candidate.email,
    resultRecipientEmail: candidate.resultRecipientEmail,
    externalId: candidate.externalId,
    birthdate: candidate.birthdate,
    extraTimePercentage: candidate.extraTimePercentage,
    createdAt: candidate.createdAt,
    authorizedToStart: candidate.authorizedToStart,
    sessionId: candidate.sessionId,
    userId: candidate.userId,
    organizationLearnerId: candidate.organizationLearnerId,
    billingMode: candidate.billingMode,
    prepaymentCode: candidate.prepaymentCode,
    subscription: candidate.subscription,
    accessibilityAdjustmentNeeded: candidate.accessibilityAdjustmentNeeded,
    reconciledAt: candidate.reconciledAt,
  });

  const dtoEvents = candidates.map((candidate) => ({
    name,
    candidateId: candidate.id,
    createdAt: candidate.createdAt,
    metadata: toDTO(candidate),
  }));
  await dependencies.eventApi.pushEvents(dtoEvents);
}
