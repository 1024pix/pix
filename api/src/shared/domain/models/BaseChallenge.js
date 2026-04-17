/**
 * @typedef {import ('../../../learning-content/domain/models/Challenge.js').Challenge} Challenge
 */
import {
  STATUSES as ORIGINAL_STATUSES,
  TYPES as ORIGINAL_TYPES,
} from '../../../learning-content/domain/models/Challenge.js';

export class BaseChallenge {
  /**
   * @type {Challenge}
   * @private
   */
  #coreChallenge;

  /**
   * @param {Challenge} coreChallenge
   */
  constructor(coreChallenge) {
    this.#coreChallenge = coreChallenge;
  }

  /**
   * @readonly
   * @type {string}
   */
  get id() {
    return this.#coreChallenge.id;
  }

  /**
   * @readonly
   * @type {string}
   */
  get instruction() {
    return this.#coreChallenge.instruction;
  }

  /**
   * @readonly
   * @type {string}
   */
  get alternativeInstruction() {
    return this.#coreChallenge.alternativeInstruction;
  }

  /**
   * @readonly
   * @type {string}
   */
  get proposals() {
    return this.#coreChallenge.proposals;
  }

  /**
   * @readonly
   * @type {TYPES[keyof TYPES]}
   */
  get type() {
    return this.#coreChallenge.type;
  }

  /**
   * @readonly
   * @type {string}
   */
  get solution() {
    return this.#coreChallenge.solution;
  }

  /**
   * @readonly
   * @type {string}
   */
  get solutionToDisplay() {
    return this.#coreChallenge.solutionToDisplay;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get t1Status() {
    return this.#coreChallenge.t1Status;
  }

  /**
   * @readonly
   * @type {string}
   */
  get t2Status() {
    return this.#coreChallenge.t2Status;
  }

  /**
   * @readonly
   * @type {string}
   */
  get t3Status() {
    return this.#coreChallenge.t3Status;
  }

  /**
   * @readonly
   * @type {STATUSES[keyof STATUSES]}
   */
  get status() {
    return this.#coreChallenge.status;
  }

  /**
   * @readonly
   * @type {string}
   */
  get genealogy() {
    return this.#coreChallenge.genealogy;
  }

  /**
   * @readonly
   * @type {string}
   */
  get blindnessCompatibility() {
    return this.#coreChallenge.accessibility1;
  }

  /**
   * @readonly
   * @type {string}
   */
  get colorBlindnessCompatibility() {
    return this.#coreChallenge.accessibility2;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get requireGafamWebsiteAccess() {
    return this.#coreChallenge.requireGafamWebsiteAccess;
  }

  /**
   * @readonly
   * @type {string}
   */
  get deafAndHardOfHearing() {
    return this.#coreChallenge.deafAndHardOfHearing;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get isIncompatibleIpadCertif() {
    return this.#coreChallenge.isIncompatibleIpadCertif;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get isAwarenessChallenge() {
    return this.#coreChallenge.isAwarenessChallenge;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get toRephrase() {
    return this.#coreChallenge.toRephrase;
  }

  /**
   * @readonly
   * @type {number}
   */
  get alternativeVersion() {
    return this.#coreChallenge.alternativeVersion;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get shuffled() {
    return this.#coreChallenge.shuffled;
  }

  /**
   * @readonly
   * @type {string}
   */
  get illustrationAlt() {
    return this.#coreChallenge.illustrationAlt;
  }

  /**
   * @readonly
   * @type {string}
   */
  get illustrationUrl() {
    return this.#coreChallenge.illustrationUrl;
  }

  /**
   * @readonly
   * @type {string[]}
   */
  get attachments() {
    return this.#coreChallenge.attachments ? [...this.#coreChallenge.attachments] : null;
  }

  /**
   * @readonly
   * @type {string}
   */
  get responsive() {
    return this.#coreChallenge.responsive;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get autoReply() {
    return this.#coreChallenge.autoReply;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get focused() {
    return this.#coreChallenge.focusable;
  }

  /**
   * @readonly
   * @type {string}
   */
  get format() {
    return this.#coreChallenge.format;
  }

  /**
   * @readonly
   * @type {number}
   */
  get timer() {
    return this.#coreChallenge.timer;
  }

  /**
   * @readonly
   * @type {number}
   */
  get embedHeight() {
    return this.#coreChallenge.embedHeight;
  }

  /**
   * @readonly
   * @type {string}
   */
  get embedUrl() {
    return this.#coreChallenge.embedUrl;
  }

  /**
   * @readonly
   * @type {string}
   */
  get embedTitle() {
    return this.#coreChallenge.embedTitle;
  }

  /**
   * @readonly
   * @type {string[]}
   */
  get locales() {
    return this.#coreChallenge.locales ? [...this.#coreChallenge.locales] : null;
  }

  /**
   * @readonly
   * @type {string}
   */
  get competenceId() {
    return this.#coreChallenge.competenceId;
  }

  /**
   * @readonly
   * @type {string}
   */
  get skillId() {
    return this.#coreChallenge.skillId;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get noValidationNeeded() {
    return this.#coreChallenge.noValidationNeeded;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get hasEmbedInternalValidation() {
    return this.#coreChallenge.hasEmbedInternalValidation;
  }

  /**
   *
   * @returns {boolean}
   */
  isTimed() {
    return Boolean(this.timer);
  }

  /**
   *
   * @returns {boolean}
   */
  hasIllustration() {
    return Boolean(this.illustrationUrl);
  }

  /**
   *
   * @returns {boolean}
   */
  hasEmbed() {
    return Boolean(this.embedUrl);
  }

  /**
   *
   * @returns {boolean}
   */
  hasAtLeastOneAttachment() {
    return this.attachments?.length > 0;
  }

  /**
   *
   * @returns {boolean}
   */
  isFocused() {
    return this.focused;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get isMobileCompliant() {
    return this.#isCompliant('Smartphone');
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get isTabletCompliant() {
    return this.#isCompliant('Tablet');
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get isOperative() {
    return [STATUSES.VALIDATED, STATUSES.ARCHIVED].includes(this.status);
  }

  #isCompliant(type) {
    return this.responsive?.includes(type);
  }
}

export const STATUSES = ORIGINAL_STATUSES;
export const TYPES = ORIGINAL_TYPES;
