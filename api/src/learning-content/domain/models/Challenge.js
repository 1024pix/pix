export const TYPES = Object.freeze({
  QCU: 'QCU',
  QCM: 'QCM',
  QROC: 'QROC',
  QROCM_IND: 'QROCM-ind',
  QROCM_DEP: 'QROCM-dep',
});

export const STATUSES = Object.freeze({
  VALIDATED: 'validé',
  ARCHIVED: 'archivé',
  OBSOLETE: 'périmé',
  PROPOSED: 'proposé',
});

export class Challenge {
  #cachedChallengeDto;

  /**
   * @param {Object} cachedChallengeDto
   */
  constructor(cachedChallengeDto) {
    this.#cachedChallengeDto = cachedChallengeDto;
  }

  /**
   * @readonly
   * @type {string}
   */
  get id() {
    return this.#cachedChallengeDto.id;
  }

  /**
   * @readonly
   * @type {string}
   */
  get instruction() {
    return this.#cachedChallengeDto.instruction;
  }

  /**
   * @readonly
   * @type {string}
   */
  get alternativeInstruction() {
    return this.#cachedChallengeDto.alternativeInstruction;
  }

  /**
   * @readonly
   * @type {string}
   */
  get proposals() {
    return this.#cachedChallengeDto.proposals;
  }

  /**
   * @readonly
   * @type {TYPES[keyof TYPES]}
   */
  get type() {
    return this.#cachedChallengeDto.type;
  }

  /**
   * @readonly
   * @type {string}
   */
  get solution() {
    return this.#cachedChallengeDto.solution;
  }

  /**
   * @readonly
   * @type {string}
   */
  get solutionToDisplay() {
    return this.#cachedChallengeDto.solutionToDisplay;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get t1Status() {
    return this.#cachedChallengeDto.t1Status;
  }

  /**
   * @readonly
   * @type {string}
   */
  get t2Status() {
    return this.#cachedChallengeDto.t2Status;
  }

  /**
   * @readonly
   * @type {string}
   */
  get t3Status() {
    return this.#cachedChallengeDto.t3Status;
  }

  /**
   * @readonly
   * @type {STATUSES[keyof STATUSES]}
   */
  get status() {
    return this.#cachedChallengeDto.status;
  }

  /**
   * @readonly
   * @type {string}
   */
  get genealogy() {
    return this.#cachedChallengeDto.genealogy;
  }

  /**
   * @readonly
   * @type {string}
   */
  get accessibility1() {
    return this.#cachedChallengeDto.accessibility1;
  }

  /**
   * @readonly
   * @type {string}
   */
  get accessibility2() {
    return this.#cachedChallengeDto.accessibility2;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get requireGafamWebsiteAccess() {
    return this.#cachedChallengeDto.requireGafamWebsiteAccess;
  }

  /**
   * @readonly
   * @type {string}
   */
  get deafAndHardOfHearing() {
    return this.#cachedChallengeDto.deafAndHardOfHearing;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get isIncompatibleIpadCertif() {
    return this.#cachedChallengeDto.isIncompatibleIpadCertif;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get isAwarenessChallenge() {
    return this.#cachedChallengeDto.isAwarenessChallenge;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get toRephrase() {
    return this.#cachedChallengeDto.toRephrase;
  }

  /**
   * @readonly
   * @type {number}
   */
  get alternativeVersion() {
    return this.#cachedChallengeDto.alternativeVersion;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get shuffled() {
    return this.#cachedChallengeDto.shuffled;
  }

  /**
   * @readonly
   * @type {string}
   */
  get illustrationAlt() {
    return this.#cachedChallengeDto.illustrationAlt;
  }

  /**
   * @readonly
   * @type {string}
   */
  get illustrationUrl() {
    return this.#cachedChallengeDto.illustrationUrl;
  }

  /**
   * @readonly
   * @type {string[]}
   */
  get attachments() {
    return this.#cachedChallengeDto.attachments ? [...this.#cachedChallengeDto.attachments] : null;
  }

  /**
   * @readonly
   * @type {string}
   */
  get responsive() {
    return this.#cachedChallengeDto.responsive;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get autoReply() {
    return this.#cachedChallengeDto.autoReply;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get focusable() {
    return this.#cachedChallengeDto.focusable;
  }

  /**
   * @readonly
   * @type {string}
   */
  get format() {
    return this.#cachedChallengeDto.format;
  }

  /**
   * @readonly
   * @type {number}
   */
  get timer() {
    return this.#cachedChallengeDto.timer;
  }

  /**
   * @readonly
   * @type {number}
   */
  get embedHeight() {
    return this.#cachedChallengeDto.embedHeight;
  }

  /**
   * @readonly
   * @type {string}
   */
  get embedUrl() {
    return this.#cachedChallengeDto.embedUrl;
  }

  /**
   * @readonly
   * @type {string}
   */
  get embedTitle() {
    return this.#cachedChallengeDto.embedTitle;
  }

  /**
   * @readonly
   * @type {string[]}
   */
  get locales() {
    return this.#cachedChallengeDto.locales ? [...this.#cachedChallengeDto.locales] : null;
  }

  /**
   * @readonly
   * @type {string}
   */
  get competenceId() {
    return this.#cachedChallengeDto.competenceId;
  }

  /**
   * @readonly
   * @type {string}
   */
  get skillId() {
    return this.#cachedChallengeDto.skillId;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get noValidationNeeded() {
    return this.#cachedChallengeDto.noValidationNeeded;
  }

  /**
   * @readonly
   * @type {boolean}
   */
  get hasEmbedInternalValidation() {
    return this.#cachedChallengeDto.hasEmbedInternalValidation;
  }
}
