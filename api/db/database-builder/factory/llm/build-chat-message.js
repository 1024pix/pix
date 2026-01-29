import { databaseBuffer } from '../../database-buffer.js';
import { buildChat } from './build-chat.js';

const TABLE_NAME = 'chat_messages';

const buildChatMessage = function ({
  id = databaseBuffer.getNextId(),
  attachmentName = 'attachmentName',
  chatId,
  content = 'Contenu du message',
  emitter = 'user',
  index = 0,
  wasModerated = false,
  createdAt = new Date(),
} = {}) {
  if (!chatId) {
    chatId = buildChat().id;
  }

  const values = {
    id,
    attachmentName,
    chatId,
    content,
    emitter,
    index,
    wasModerated,
    createdAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: TABLE_NAME,
    values,
  });
};

export { buildChatMessage };
