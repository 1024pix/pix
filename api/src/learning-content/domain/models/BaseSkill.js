import { getTranslatedKey } from '../../../shared/domain/services/get-translated-text.js';

export class BaseSkill {
  /**
   * @param {Object} cachedSkillDto
   */
  constructor(cachedSkillDto) {
    /** @private */
    this._cachedSkillDto = cachedSkillDto;
  }

  /**
   * @readonly
   * @type {string}
   */
  get id() {
    return this._cachedSkillDto.id;
  }

  /**
   * @readonly
   * @type {string}
   */
  get name() {
    return this._cachedSkillDto.name;
  }

  /**
   * @readonly
   * @type {number}
   */
  get pixValue() {
    return this._cachedSkillDto.pixValue;
  }

  /**
   * @readonly
   * @type {number}
   */
  get difficulty() {
    return this._cachedSkillDto.level;
  }

  /**
   * @readonly
   * @type {string}
   */
  get version() {
    return this._cachedSkillDto.version;
  }

  /**
   * @readonly
   * @type {string}
   */
  get status() {
    return this._cachedSkillDto.status;
  }

  /**
   * @readonly
   * @type {string}
   */
  get hintStatus() {
    return this._cachedSkillDto.hintStatus;
  }

  /**
   * @readonly
   * @type {string[]|null}
   */
  get tutorialIds() {
    return this._cachedSkillDto.tutorialIds ? [...this._cachedSkillDto.tutorialIds] : null;
  }

  /**
   * @readonly
   * @type {string[]|null}
   */
  get learningMoreTutorialIds() {
    return this._cachedSkillDto.learningMoreTutorialIds ? [...this._cachedSkillDto.learningMoreTutorialIds] : null;
  }

  /**
   * @readonly
   * @type {string}
   */
  get tubeId() {
    return this._cachedSkillDto.tubeId;
  }

  /**
   * @readonly
   * @type {string}
   */
  get competenceId() {
    return this._cachedSkillDto.competenceId;
  }

  /**
   * @param {Object} options
   * @param {string} options.locale
   * @param {boolean} [options.useFallback=true]
   * @returns {string|null}
   */
  hint({ locale, useFallback = true }) {
    return getTranslatedKey(this._cachedSkillDto.hint_i18n, locale, useFallback) ?? null;
  }
}
