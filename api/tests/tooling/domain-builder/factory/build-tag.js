import { Tag } from '../../../../lib/domain/models/Tag.js';

function buildTag({ id = 123, name = 'Type' } = {}) {
  return new Tag({
    id,
    name,
  });
}

export { buildTag };
