import Tag from '../../../../lib/domain/models/Tag';

function buildTag({ id = 123, name = 'Type' } = {}) {
  return new Tag({
    id,
    name,
  });
}

export default buildTag;
