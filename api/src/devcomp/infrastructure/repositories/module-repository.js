import { NotFoundError } from '../../../shared/domain/errors.js';
import { Module } from '../../domain/models/Module.js';
import { Lesson } from '../../domain/models/element/Lesson.js';
import { QCU } from '../../domain/models/element/QCU.js';

async function getBySlug({ slug, moduleDatasource }) {
  try {
    const moduleData = await moduleDatasource.getBySlug(slug);

    return _toDomain(moduleData);
  } catch (e) {
    throw new NotFoundError();
  }
}

function _toDomain(moduleData) {
  return new Module({
    id: moduleData.id,
    slug: moduleData.slug,
    title: moduleData.title,
    list: moduleData.list.map((element) => {
      if (element.type === 'qcu') {
        return new QCU({
          id: element.id,
          instruction: element.instruction,
          locales: element.locales,
          proposals: element.proposals,
        });
      }

      return new Lesson({
        id: element.id,
        content: element.content,
      });
    }),
  });
}

export { getBySlug };
