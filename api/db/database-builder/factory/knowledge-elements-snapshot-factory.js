import { databaseBuffer } from '../database-buffer.js';
import { buildKnowledgeElement } from './build-knowledge-element.js';

function buildSnapshot({ id, userId, snappedAt, knowledgeElementsAttributes }) {
  const knowledgeElements = knowledgeElementsAttributes.map((attributes) => buildKnowledgeElement(attributes));

  const values = {
    id,
    userId,
    snappedAt,
    snapshot: JSON.stringify(knowledgeElements),
  };

  return databaseBuffer.pushInsertable({
    tableName: 'knowledge-element-snapshots',
    values,
  });
}

export { buildSnapshot };
