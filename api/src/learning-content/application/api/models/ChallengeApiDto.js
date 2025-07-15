export class ChallengeApiDto {
  #originalChallengeDto;

  constructor(originalChallengeDto) {
    this.#originalChallengeDto = originalChallengeDto;
  }

  get id() {
    return this.#originalChallengeDto.id;
  }

  get instruction() {
    return this.#originalChallengeDto.instruction;
  }

  get alternativeInstruction() {
    return this.#originalChallengeDto.alternativeInstruction;
  }

  get proposals() {
    return this.#originalChallengeDto.proposals;
  }

  get type() {
    return this.#originalChallengeDto.type;
  }

  get solution() {
    return this.#originalChallengeDto.solution;
  }

  get solutionToDisplay() {
    return this.#originalChallengeDto.solutionToDisplay;
  }

  get t1Status() {
    return this.#originalChallengeDto.t1Status;
  }

  get t2Status() {
    return this.#originalChallengeDto.t2Status;
  }

  get t3Status() {
    return this.#originalChallengeDto.t3Status;
  }

  get status() {
    return this.#originalChallengeDto.status;
  }

  get skillId() {
    return this.#originalChallengeDto.skillId;
  }

  get timer() {
    return this.#originalChallengeDto.timer;
  }

  get competenceId() {
    return this.#originalChallengeDto.competenceId;
  }

  get embedUrl() {
    return this.#originalChallengeDto.embedUrl;
  }

  get embedTitle() {
    return this.#originalChallengeDto.embedTitle;
  }

  get embedHeight() {
    return this.#originalChallengeDto.embedHeight;
  }

  get format() {
    return this.#originalChallengeDto.format;
  }

  get autoReply() {
    return this.#originalChallengeDto.autoReply;
  }

  get locales() {
    return this.#originalChallengeDto.locales;
  }

  get focused() {
    return this.#originalChallengeDto.focusable;
  }

  get difficulty() {
    return this.#originalChallengeDto.delta;
  }

  get discriminant() {
    return this.#originalChallengeDto.alpha;
  }

  get responsive() {
    return this.#originalChallengeDto.responsive;
  }

  get genealogy() {
    return this.#originalChallengeDto.genealogy;
  }

  get attachments() {
    return this.#originalChallengeDto.attachments;
  }

  get illustrationAlt() {
    return this.#originalChallengeDto.illustrationAlt;
  }

  get illustrationUrl() {
    return this.#originalChallengeDto.illustrationUrl;
  }

  get shuffled() {
    return this.#originalChallengeDto.shuffled;
  }

  get alternativeVersion() {
    return this.#originalChallengeDto.alternativeVersion;
  }

  get blindnessCompatibility() {
    return this.#originalChallengeDto.accessibility1;
  }

  get colorBlindnessCompatibility() {
    return this.#originalChallengeDto.accessibility2;
  }

  get requireGafamWebsiteAccess() {
    return this.#originalChallengeDto.requireGafamWebsiteAccess;
  }

  get isIncompatibleIpadCertif() {
    return this.#originalChallengeDto.isIncompatibleIpadCertif;
  }

  get deafAndHardOfHearing() {
    return this.#originalChallengeDto.deafAndHardOfHearing;
  }

  get isAwarenessChallenge() {
    return this.#originalChallengeDto.isAwarenessChallenge;
  }

  get toRephrase() {
    return this.#originalChallengeDto.toRephrase;
  }

  get hasEmbedInternalValidation() {
    return this.#originalChallengeDto.hasEmbedInternalValidation;
  }

  get noValidationNeeded() {
    return this.#originalChallengeDto.noValidationNeeded;
  }
}
