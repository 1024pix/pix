export class Configuration {
  /** @type {ConfigurationDTO} */
  #dto;

  /**
   * @param {ConfigurationDTO} configurationDTO
   */
  constructor(configurationDTO) {
    this.#dto = configurationDTO;
  }

  get inputMaxChars() {
    return this.#dto.challenge.inputMaxChars;
  }

  get inputMaxPrompts() {
    return this.#dto.challenge.inputMaxPrompts;
  }

  get hasAttachment() {
    return this.#dto.attachment != undefined;
  }

  get hasVictoryConditions() {
    return !!this.#dto.challenge?.victoryConditions?.expectations?.length;
  }

  get attachmentName() {
    return this.#dto.attachment?.name;
  }

  get attachmentContext() {
    return this.#dto.attachment?.context;
  }

  get context() {
    return this.#dto.challenge?.context;
  }

  toDTO() {
    return this.#dto;
  }

  /**
   * @param {ConfigurationDTO} configurationDTO
   */
  static fromDTO(configurationDTO) {
    return new Configuration(configurationDTO);
  }
}

/**
 * @typedef {object} ConfigurationDTO
 * @property {string} name
 * @property {object} challenge
 * @property {string[]} challenge.tools
 * @property {string} challenge.description
 * @property {string} challenge.systemPrompt
 * @property {number} challenge.inputMaxChars
 * @property {number} challenge.inputMaxPrompts
 * @property {object} challenge.victoryConditions FIXME add victoryConditions properties
 * @property {string=} challenge.context
 * @property {Attachment=} attachment
 * @property {object=} preview
 * @property {string=} preview.moderationPrompt
 * @property {string=} preview.validationPrompt
 */

/**
 * @typedef {object} Attachment
 * @property {string} name
 * @property {string} context
 */
