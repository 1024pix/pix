import { knex } from '../../../../db/knex-database-connection.js';
import { Framework } from '../../domain/models/Framework.js';
import { LearningContentRepository } from './learning-content-repository.js';

const tableName = 'learningcontent.frameworks';

class FrameworkRepository extends LearningContentRepository {
  constructor() {
    super({ tableName });
  }

  async list() {
    const frameworkDtos = await knex.select('*').from(tableName).orderBy('name');
    return frameworkDtos.map(toDomain);
  }

  toDto({ id, name }) {
    return { id, name };
  }
}

function toDomain({ id, name }) {
  return new Framework({ id, name });
}

export const frameworkRepository = new FrameworkRepository();
