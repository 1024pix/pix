import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import _ from 'lodash';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

export class LearningContentRepository {
  /** @type {string} */
  #tableName;

  /** @type {number} */
  #chunkSize;

  /** @type {Array<string>} */
  #rawFields;

  /**
   * @param {{
   *   tableName: string
   *   chunkSize?: number
   *   rawields?: Array<string>
   * }} config
   */
  constructor({ tableName, chunkSize = 1000, rawFields = [] }) {
    this.#tableName = tableName;
    this.#chunkSize = chunkSize;
    this.#rawFields = rawFields;
  }

  /**
   *
   * @param {any} obj
   * @param {Function} rawFunction
   * @returns
   */
  fixRawFieldValues(obj, rawFunction) {
    return this.#rawFields?.length ? { ...obj, ...(_(obj).pick(this.#rawFields).mapValues(rawFunction).value()) } : obj;
  }

  /**
   * @param {object[]} objects
   */
  async saveMany(objects) {
    if (!objects) return;
    logger.debug(`saving ${objects.length} items in ${this.#tableName}`);
    //const dtos = objects.map(this.toDto);
    const knex = DomainTransaction.getConnection();
    const dtos = objects.map((obj) => this.fixRawFieldValues(this.toDto(obj), (dto) => knex.raw(dto)));
    for (const chunk of chunks(dtos, this.#chunkSize)) {
      await knex.insert(chunk).into(this.#tableName).onConflict('id').merge();
    }
  }

  /**
   * @param {object} object
   */
  async save(object) {
    logger.debug(`saving one item in ${this.#tableName}`);
    const knex = DomainTransaction.getConnection();
    const dto = this.fixRawFieldValues(this.toDto(object), (dto) => knex.raw(dto));
    await knex.insert(dto).into(this.#tableName).onConflict('id').merge();
  }

  /**
   * Maps an object to a DTO before insertion.
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
