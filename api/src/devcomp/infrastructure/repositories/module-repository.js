import { NotFoundError } from '../../../shared/domain/errors.js';
import { Module } from '../../domain/models/Module.js';
import { Lesson } from '../../domain/models/Lesson.js';

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
    title: moduleData.title,
    list: moduleData.list.map(
      (lesson) =>
        new Lesson({
          id: lesson.id,
          content: lesson.content,
        }),
    ),
  });
}

export { getBySlug };
