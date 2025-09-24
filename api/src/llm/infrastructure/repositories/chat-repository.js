import { config } from '../../../shared/config.js';
import { temporaryStorage } from '../../../shared/infrastructure/key-value-storages/index.js';
import { ChatNotFoundError } from '../../domain/errors.js';
import { Chat } from '../../domain/models/Chat.js';
import * as configurationRepository from './configuration-repository.js';

export const CHAT_STORAGE_PREFIX = 'llm-chats:';
const chatsTemporaryStorage = temporaryStorage.withPrefix(CHAT_STORAGE_PREFIX);

/**
 * @typedef {import('../../domain/Chat').Chat} Chat
 */

/**
 * @function
 * @name save
 *
 * @param {Chat} chat
 * @returns {Promise<void>}
 */
export async function save(chat) {
  await chatsTemporaryStorage.save({
    key: chat.id,
    value: chat.toDTO(),
    expirationDelaySeconds: config.llm.temporaryStorage.expirationDelaySeconds,
  });
  //TODO: remove me
  return true;
}

/**
 * @function
 * @name get
 *
 * @param {string} id
 * @returns {Promise<Chat>}
 */
export async function get(id) {
  const chatDTO = await chatsTemporaryStorage.get(id);
  if (!chatDTO) {
    throw new ChatNotFoundError(id);
  }
  // backward compatibility, may be removed after some time
  if (!chatDTO.configuration.llm && chatDTO.configuration.id) {
    chatDTO.configurationId = chatDTO.configuration.id;
    const configuration = await configurationRepository.get(chatDTO.configurationId);
    chatDTO.configuration = configuration.toDTO();
  }
  return Chat.fromDTO(chatDTO);
}
