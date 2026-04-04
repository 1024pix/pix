export class Skill {
  #cachedSkillDto;

  /**
   * @param {Object} cachedSkillDto
   */
  constructor(cachedSkillDto) {
    this.#cachedSkillDto = cachedSkillDto;
  }

  /**
   * @readonly
   * @type {string}
   */
  get id() {
    return this.#cachedSkillDto.id;
  }

  /**
   * @readonly
   * @type {string}
   */
  get name() {
    return this.#cachedSkillDto.name;
  }

  /**
   * @readonly
   * @type {number}
   */
  get pixValue() {
    return this.#cachedSkillDto.pixValue;
  }

  /**
   * @readonly
   * @type {number}
   */
  get version() {
    return this.#cachedSkillDto.version;
  }

  /**
   * @readonly
   * @type {number}
   */
  get level() {
    return this.#cachedSkillDto.level;
  }

  /**
   * @readonly
   * @type {string}
   */
  get status() {
    return this.#cachedSkillDto.status;
  }

  /**
   * @readonly
   * @type {string}
   */
  get hintStatus() {
    return this.#cachedSkillDto.hintStatus;
  }

  /**
   * @readonly
   * @type {object}
   */
  get hint_i18n() {
    return structuredClone(this.#cachedSkillDto.hint_i18n);
  }

  /**
   * @readonly
   * @type {string}
   */
  get competenceId() {
    return this.#cachedSkillDto.competenceId;
  }

  /**
   * @readonly
   * @type {string}
   */
  get tubeId() {
    return this.#cachedSkillDto.tubeId;
  }

  /**
   * @readonly
   * @type {string[]}
   */
  get tutorialIds() {
    return this.#cachedSkillDto.tutorialIds ? [...this.#cachedSkillDto.tutorialIds] : null;
  }

  /**
   * @readonly
   * @type {string[]}
   */
  get learningMoreTutorialIds() {
    return this.#cachedSkillDto.learningMoreTutorialIds ? [...this.#cachedSkillDto.learningMoreTutorialIds] : null;
  }
}
