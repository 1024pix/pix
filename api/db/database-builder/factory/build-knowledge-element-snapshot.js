import _ from 'lodash';

import { KnowledgeElementCollection } from '../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildKnowledgeElement } from './build-knowledge-element.js';
import { buildUser } from './build-user.js';

const buildKnowledgeElementSnapshot = function ({
  id = databaseBuffer.getNextId(),
  snapshot,
  campaignParticipationId,
  userId,
} = {}) {
  if (!snapshot) {
    const knowledgeElements = [];
    userId = _.isUndefined(userId) ? buildUser().id : userId;
    knowledgeElements.push(buildKnowledgeElement({ userId, createdAt: new Date('2020-01-01') }));
    knowledgeElements.push(buildKnowledgeElement({ userId, createdAt: new Date('2020-01-01') }));
    snapshot = new KnowledgeElementCollection(knowledgeElements).toSnapshot();
  }

  const values = {
    id,
    snapshot,
    campaignParticipationId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'knowledge-element-snapshots',
    values,
  });
};

export { buildKnowledgeElementSnapshot };
