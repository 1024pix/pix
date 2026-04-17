import { BaseChallenge } from '../../../../shared/domain/models/BaseChallenge.js';

/**
 * @class Challenge
 * @extends BaseChallenge
 * @description
 * This model represents a Challenge as used in the certification/configuration bounded-context.
 * Although it inherits all fields from BaseChallenge, the following are the
 * only fields documented to be indeed used in this bounded-context :
 * @property {string} id
 * @property {string} skillId
 */
export class Challenge extends BaseChallenge {
  constructor(coreChallenge) {
    super(coreChallenge);
  }
}
