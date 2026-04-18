import { BaseChallenge, STATUSES as ORIGINAL_STATUSES } from '../../../shared/domain/models/BaseChallenge.js';

/**
 * @class ChallengeToPlay
 * @extends BaseChallenge
 * @description
 * This model represents a Challenge as used in the evaluation bounded context, regarding when it's about playing a challenge.
 * Although it inherits all fields from BaseChallenge, the following are the
 * only fields documented to be indeed used in evaluation code :
 * @property {string} id
 * @property {string} type
 * @property {string} format
 * @property {string} instruction
 * @property {string} alternativeInstruction
 * @property {string} proposals
 * @property {number|null} timer
 * @property {string} illustrationUrl
 * @property {string} illustrationAlt
 * @property {string} embedUrl
 * @property {string} embedTitle
 * @property {number} embedHeight
 * @property {string[]|null} attachments
 * @property {string} competenceId
 * @property {boolean} focused
 * @property {boolean} autoReply
 * @property {boolean} shuffled
 * @property {boolean} noValidationNeeded
 * @property {boolean} hasEmbedInternalValidation
 * @property {string[]|null} locales
 */
export class ChallengeToPlay extends BaseChallenge {
  constructor(coreChallenge, webComponentTagName, webComponentProps) {
    super(coreChallenge);
    this.webComponentTagName = webComponentTagName;
    this.webComponentProps = webComponentProps;
  }
}
export const STATUSES = ORIGINAL_STATUSES;
