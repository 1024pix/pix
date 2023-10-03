import { NotFoundError } from '../../../shared/domain/errors.js';

async function getBySlug({ slug, moduleDatasource }) {
  try {
    return await moduleDatasource.getBySlug(slug);
  } catch (e) {
    throw new NotFoundError();
  }
}

export { getBySlug };
