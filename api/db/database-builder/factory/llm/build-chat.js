import { randomUUID } from 'node:crypto';

import { databaseBuffer } from '../../database-buffer.js';

const TABLE_NAME = 'chats';

const buildChat = function ({
  id = randomUUID(),
  userId = null,
  assessmentId = null,
  challengeId = null,
  configId = null,
  configContent = {
    challenge: {
      victoryConditions: {
        expectations: [
          {
            type: 'answer_contains',
            value: 'merguez',
          },
        ],
      },
    },
  },
  haveVictoryConditionsBeenFulfilled = false,
  moduleId = null,
  passageId = null,
  startedAt = new Date(),
  totalInputTokens = 0,
  totalOutputTokens = 0,
  updatedAt = new Date(),
} = {}) {
  const values = {
    id,
    userId,
    assessmentId,
    challengeId,
    configId,
    configContent,
    moduleId,
    passageId,
    haveVictoryConditionsBeenFulfilled,
    totalInputTokens,
    totalOutputTokens,
    startedAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: TABLE_NAME,
    values,
  });
};

export { buildChat };
