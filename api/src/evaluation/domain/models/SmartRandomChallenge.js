import { BaseChallenge, STATUSES as ORIGINAL_STATUSES } from '../../../shared/domain/models/BaseChallenge.js';

/**
 * @class SmartRandomChallenge
 * @extends BaseChallenge
 * @description
 * This model represents a Challenge as used in the SmartRandom functions.
 * Although it inherits all fields from BaseChallenge, the following are the
 * only fields documented to be indeed used in SmartRandom functions :
 * @property {string} id
 * @property {string[]|null} locales
 * @property {string} status
 * @property {string} skillId
 * @property {number|null} timer
 */
export class SmartRandomChallenge extends BaseChallenge {
  constructor(coreChallenge) {
    super(coreChallenge);
  }
}
export const STATUSES = ORIGINAL_STATUSES;
