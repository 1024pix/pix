import { DomainTransaction } from '../shared/domain/DomainTransaction.js';

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
   * @param {object[]} dtos
   */
  async save(dtos) {
    if (!dtos) return;
    const knex = DomainTransaction.getConnection();
    for (const chunk of chunks(dtos, this.#chunkSize)) {
      await knex.insert(chunk).into(this.#tableName).onConflict('id').merge();
    }
  }
}

function chunks(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
