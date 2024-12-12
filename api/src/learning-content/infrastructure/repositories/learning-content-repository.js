import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';

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
   * @param {object[]} objects
   */
  async save(objects) {
    if (!objects) return;
    const dtos = objects.map(this.toDto);
    const knex = DomainTransaction.getConnection();
    for (const chunk of chunks(dtos, this.#chunkSize)) {
      await knex.insert(chunk).into(this.#tableName).onConflict('id').merge();
    }
  }

  /**
   * Maps an object to a DTO before insertion.
   * @param {object} object
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
