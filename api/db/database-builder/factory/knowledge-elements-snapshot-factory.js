import { databaseBuffer } from '../database-buffer.js';
import { buildKnowledgeElement } from './build-knowledge-element.js';

function buildSnapshot({ id, knowledgeElementsAttributes, campaignParticipationId }) {
  const knowledgeElements = knowledgeElementsAttributes.map((attributes) => buildKnowledgeElement(attributes));

  const values = {
    id,
    snapshot: JSON.stringify(knowledgeElements),
    campaignParticipationId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'knowledge-element-snapshots',
    values,
  });
}

export { buildSnapshot };
