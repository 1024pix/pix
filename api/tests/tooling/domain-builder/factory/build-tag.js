import { Tag } from '../../../../lib/shared/domain/models/Tag.js';

function buildTag({ id = 123, name = 'Type' } = {}) {
  return new Tag({
    id,
    name,
  });
}

export { buildTag };
