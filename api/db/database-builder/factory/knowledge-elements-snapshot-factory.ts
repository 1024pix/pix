import { databaseBuffer } from '../database-buffer.ts';
import { buildKnowledgeElement, type KnowledgeElementAttributes } from './build-knowledge-element.ts';

type SnapshotAttributes = {
  id?: number;
  knowledgeElementsAttributes: KnowledgeElementAttributes[];
  campaignParticipationId: number;
};

const buildSnapshot = ({ id, knowledgeElementsAttributes, campaignParticipationId }: SnapshotAttributes) => {
  const knowledgeElements = knowledgeElementsAttributes.map((attributes) => buildKnowledgeElement(attributes));
  const values = { id, snapshot: JSON.stringify(knowledgeElements), campaignParticipationId };
  return databaseBuffer.pushInsertable({ tableName: 'knowledge-element-snapshots', values });
};

export { buildSnapshot };
