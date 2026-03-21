import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { getCorrelationContext } from '../../../shared/infrastructure/execution-context-manager.js';
import { Chat } from '../../domain/models/Chat.js';

/**
 * @typedef {import('../../domain/models/Chat').Message} Message
 */

/**
 * @function
 * @name get
 *
 * @param {UUID} chatId
 * @returns {Promise<Chat|null>}
 */
export async function get(chatId) {
  const knexConn = DomainTransaction.getConnection();
  const chatDTO = await knexConn('chats').where({ id: chatId }).first();
  if (!chatDTO) return null;
  const messageDTOs = await knexConn('chat_messages').where({ chatId }).orderBy('index');
  return toDomain(
    {
      ...chatDTO,
      configurationId: chatDTO.configId,
      configuration: chatDTO.configContent,
    },
    messageDTOs,
  );
}

function toDomain(chatDTO, messageDTOs) {
  return Chat.fromDTO({
    ...chatDTO,
    messages: messageDTOs,
  });
}

/**
 * @function
 * @name save
 *
 * @param {Chat} chat
 * @returns {Promise<void>}
 */
export async function save(chat) {
  const knexConn = DomainTransaction.getConnection();
  const chatDTO = chat.toDTO();
  const {
    id: chatId,
    userId,
    assessmentId,
    challengeId,
    configurationId: configId,
    configuration: configContent,
    moduleId,
    passageId,
    haveVictoryConditionsBeenFulfilled,
    totalInputTokens,
    totalOutputTokens,
  } = chatDTO;
  const startedAt = new Date();
  const updatedAt = new Date();

  await knexConn('chats')
    .insert({
      id: chatId,
      userId,
      assessmentId,
      challengeId,
      configContent,
      configId,
      haveVictoryConditionsBeenFulfilled,
      moduleId,
      passageId,
      startedAt,
      totalInputTokens,
      totalOutputTokens,
      updatedAt,
    })
    .onConflict(['id'])
    .merge(['haveVictoryConditionsBeenFulfilled', 'totalInputTokens', 'totalOutputTokens', 'updatedAt']);

  for (const message of chatDTO.messages) {
    const databaseMessage = _buildDatabaseMessage({ chatId, message });
    await knexConn('chat_messages').insert(databaseMessage).onConflict(['chatId', 'index']).ignore();
  }
}

/**
 * @function
 * @name _buildDatabaseMessage
 *
 * @param {Object} params
 * @param {string} params.chatId chatId
 * @param {Message} params.message message
 * @returns {Promise<void>}
 */
function _buildDatabaseMessage({ chatId, message }) {
  const { index, attachmentName, content, emitter, wasModerated } = message;

  return {
    attachmentName,
    chatId,
    content,
    emitter,
    index,
    wasModerated: wasModerated ?? null,
    requestId: getCorrelationContext().request_id,
  };
}
