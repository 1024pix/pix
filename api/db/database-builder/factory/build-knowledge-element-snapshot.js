import _ from 'lodash';

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
    userId = _.isUndefined(userId) ? buildUser().id : userId;
    // Instantané au format historique — une entrée par acquis — encore lisible
    // par la désérialisation, qui le replie en état.
    const knowledgeElement = buildKnowledgeElement({ userId, createdAt: new Date('2020-01-01') });
    snapshot = JSON.stringify([
      _.pick(knowledgeElement, ['createdAt', 'source', 'status', 'earnedPix', 'skillId', 'competenceId']),
    ]);
  }

  const values = {
    id,
    snapshot,
    campaignParticipationId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'knowledge-state-snapshots',
    values,
  });
};

export { buildKnowledgeElementSnapshot };
