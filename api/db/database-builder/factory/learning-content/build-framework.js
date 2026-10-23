import { databaseBuffer } from '../../database-buffer.ts';

export function buildFramework({ id = 'frameworkPix', name = 'Pix' } = {}) {
  return buildFrameworkInDB({ id, name });
}

export function buildFrameworkWithNoDefaultValues({ id, name }) {
  return buildFrameworkInDB({ id, name });
}

function buildFrameworkInDB({ id, name }) {
  const values = {
    id,
    name,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'learningcontent.frameworks',
    values,
  });
}
