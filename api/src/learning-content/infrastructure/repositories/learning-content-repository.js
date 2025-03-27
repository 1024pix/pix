import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

export class LearningContentRepository {
  /** @type {string} */
  #tableName;

  /** @type {number} */
  #chunkSize;

  /**
   * @param {{
   *   tableName: string
   *   chunkSize?: number
   * }} config
   */
  constructor({ tableName, chunkSize = 1000 }) {
    this.#tableName = tableName;
    this.#chunkSize = chunkSize;
  }

  /**
   * @param {object[]} objects Objects coming directly from the LCMS release
   */
  async saveMany(objects) {
    if (!objects) return;
    logger.debug(`saving ${objects.length} items in ${this.#tableName}`);
    const dtos = objects.map(this.toDto);
    const knex = DomainTransaction.getConnection();
    for (const chunk of chunks(dtos, this.#chunkSize)) {
      await knex.insert(chunk).into(this.#tableName).onConflict('id').merge();
    }
  }

  /**
   * @param {object} object Object coming directly from the LCMS release
   */
  async save(object) {
    logger.debug(`saving one item in ${this.#tableName}`);
    const dto = this.toDto(object);
    const knex = DomainTransaction.getConnection();
    await knex.insert(dto).into(this.#tableName).onConflict('id').merge();
  }

  /**
   * Maps a release object to a DTO before insertion.
   * @param {object} _object
   * @returns {object}
   */
  toDto(_object) {
    // must be overridden
  }
}

function chunks(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
