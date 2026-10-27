import { KnowledgeElementCollection } from '../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { databaseBuffer } from '../database-buffer.ts';
import { buildKnowledgeElement } from './build-knowledge-element.ts';
import { buildUser } from './build-user.js';

type KnowledgeElementSnapshotAttributes = {
  id?: number;
  snapshot?: string;
  campaignParticipationId?: number;
  userId?: number;
};

const buildDefaultSnapshot = (userId = buildUser().id): string => {
  const createdAt = new Date('2020-01-01');
  const knowledgeElements = [
    buildKnowledgeElement({ userId, createdAt }),
    buildKnowledgeElement({ userId, createdAt }),
  ];
  return new KnowledgeElementCollection(knowledgeElements).toSnapshot();
};

const buildKnowledgeElementSnapshot = ({
  id = databaseBuffer.getNextId(),
  campaignParticipationId,
  userId,
  snapshot = buildDefaultSnapshot(userId),
}: KnowledgeElementSnapshotAttributes = {}) => {
  const values = { id, snapshot, campaignParticipationId };
  return databaseBuffer.pushInsertable({ tableName: 'knowledge-element-snapshots', values });
};

export { buildKnowledgeElementSnapshot };
