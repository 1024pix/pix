import { Chat } from '../models/Chat.js';

/**
 * @typedef {import ('../../infrastructure/repositories/index.js').chatRepository} ChatRepository
 * @typedef {import ('../../infrastructure/repositories/index.js').configurationRepository} ConfigurationRepository
 * @typedef {import ('../models/Configuration.js').Configuration} Configuration
 */

/**
 * @param {Object} params
 * @param {Configuration} params.configuration
 * @param {string=} params.configurationId
 * @param {number=} params.userId
 * @param {number=} params.assessmentId
 * @param {string=} params.challengeId
 * @param {number=} params.passageId
 * @param {string=} params.moduleId
 * @param {ChatRepository} params.chatRepository
 * @param {ConfigurationRepository} params.configurationRepository
 * @param {() => UUID} params.randomUUID
 */
export async function startChat({
  configuration,
  configurationId,
  userId,
  assessmentId,
  challengeId,
  passageId,
  moduleId,
  chatRepository,
  configurationRepository,
  randomUUID,
}) {
  const chatConfiguration = configuration || (await configurationRepository.get(configurationId));
  const chatId = randomUUID();
  const newChat = new Chat({
    id: chatId,
    userId,
    assessmentId,
    challengeId,
    moduleId,
    passageId,
    configurationId,
    configuration: chatConfiguration,
    messages: [],
    totalInputTokens: 0,
    totalOutputTokens: 0,
  });
  await chatRepository.save(newChat);
  return newChat;
}
