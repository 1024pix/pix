/**
 * @typedef {import ('../../domain/models/Candidate.js').Candidate} Candidate
 */
import { withTransaction } from "../../../../shared/domain/DomainTransaction.js";
import { WrongDomainExtensionForPixPlusError } from "../../domain/errors.js";
import { usecases } from "../../domain/usecases/index.js";

/**
 * Candidate entry to a certification is a multi step process
 * @param {object} params
 * @param {number} params.userId
 * @param {number} params.sessionId
 * @param {string} params.firstName
 * @param {string} params.lastName
 * @param {Date} params.birthdate
 * @param {boolean} params.isFrenchDomainExtension
 * @param {Function} params.normalizeStringFnc
 * @returns {Promise<Candidate>}
 */
export const registerCandidateParticipation = withTransaction(
  async ({ userId, sessionId, firstName, lastName, birthdate, isFrenchDomainExtension, normalizeStringFnc }) => {
    const candidate = await usecases.verifyCandidateIdentity({
      userId,
      sessionId,
      firstName,
      lastName,
      birthdate,
      normalizeStringFnc,
    });

    if (!candidate.hasCoreScopeSubscription() && !isFrenchDomainExtension) {
      throw new WrongDomainExtensionForPixPlusError();
    }

    if (candidate.isReconciled()) {
      return candidate;
    }

    const reconciliedCandidate = await usecases.reconcileCandidate({
      userId,
      candidate,
    });

    await usecases.verifyCandidateReconciliationRequirements({
      candidate: reconciliedCandidate,
      sessionId,
    });

    return reconciliedCandidate;
  },
);
