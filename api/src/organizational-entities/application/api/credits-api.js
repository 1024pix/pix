import { NoCreditAvailableError } from '../../domain/errors.js';
import { usecases } from '../../domain/usecases/index.js';

/**
 * @module CreditsApi
 */

/**
 * @function
 * @name consumeCredit
 *
 * @param {{ organizationLearnerId: number, organizationId: number }} payload
 * @returns {Promise<void>}
 * @throws {NoCreditAvailableError}
 */
export const consumeCredit = async ({ organizationLearnerId, organizationId }) => {
  return usecases.consumeCredit({ organizationLearnerId, organizationId });
};

export { NoCreditAvailableError };
