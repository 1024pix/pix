import { knex } from '../../../../db/knex-database-connection.js';
import { clearCache } from '../../../devcomp/infrastructure/repositories/module-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

class ModuleRepository extends LearningContentRepository {
  constructor() {
    super({ tableName: 'learningcontent.modules' });
  }

  toDto({ id, shortId, slug, title, isBeta, sections, details, visibility, glossary, version }) {
    return {
      id,
      shortId,
      slug,
      title,
      isBeta,
      sections: JSON.stringify(sections),
      visibility,
      glossary: JSON.stringify(glossary),
      version,
      ...details,
    };
  }

  clearCache(id) {
    clearCache(id);
  }

  list() {
    return knex('learningcontent.modules').select('*');
  }
}

export const moduleRepository = new ModuleRepository();
