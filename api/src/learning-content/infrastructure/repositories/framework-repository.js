import { knex } from '../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { Framework } from '../../domain/models/Framework.js';
import { LearningContentRepository } from './learning-content-repository.js';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

const tableName = 'learningcontent.frameworks';

class FrameworkRepository extends LearningContentRepository {
  constructor() {
    super({ tableName });
  }

  async list() {
    const frameworkDtos = await knex.select('*').from(tableName).orderBy('name');
    return frameworkDtos.map(toDomain);
  }

  /**
   * @param {string} name
   */
  async getByName(name) {
    const frameworkDto = await knex.select('*').from(tableName).where('name', name).first();
    if (!frameworkDto) {
      logger.warn({ frameworkName: name }, 'Référentiel introuvable');
      throw new NotFoundError(`Framework not found for name ${name}`);
    }
    return toDomain(frameworkDto);
  }

  toDto({ id, name }) {
    return { id, name };
  }
}

function toDomain({ id, name }) {
  return new Framework({ id, name });
}

export const frameworkRepository = new FrameworkRepository();
