import databaseBuffer from '../database-buffer';

export default function buildTag({ id = databaseBuffer.getNextId(), name = 'Tag' } = {}) {
  const values = {
    id,
    name,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'tags',
    values,
  });
}
