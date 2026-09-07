import { config } from '../../../../config/config.js';
import { getRequestId } from '../../../shared/infrastructure/execution-context-manager.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { ChatForbiddenError, ChatNotFoundError, LLMApiError, PromptAlreadyOngoingError } from '../errors.js';
import { Chat } from '../models/Chat.js';

/**
 * @typedef {import ('../../infrastructure/repositories/index.js').chatRepository} ChatRepository
 * @typedef {import ('../../infrastructure/repositories/index.js').promptRepository} PromptRepository
 * @typedef {import ('../../../shared/infrastructure/mutex/RedisMutex.js').redisMutex} RedisMutex
 * @typedef {import ('../../infrastructure/streaming/llm-response-handler.js').LLMResponseHandler} LLMResponseHandler
 * @typedef {import ('../../infrastructure/streaming/llm-response-handler.js').LLMResponseMetadata} LLMResponseMetadata
 * @typedef {typeof defaultLogger} Logger
 */

const defaultLogger = child('llm:api', { event: SCOPES.LLM });

/**
 * @param {object} params
 * @param {string=} params.chatId
 * @param {number=} params.userId
 * @param {string=} params.message
 * @param {string=} params.attachmentName
 * @param {ChatRepository} params.chatRepository
 * @param {PromptRepository} params.promptRepository
 * @param {RedisMutex} params.redisMutex
 * @param {LLMResponseHandler} params.llmResponseHandler
 * @param {Logger=} params.logger
 * @returns {Promise<void>}
 */
export async function promptChat({
  chatId,
  userId,
  message,
  attachmentName,
  chatRepository,
  promptRepository,
  redisMutex,
  llmResponseHandler,
  logger = defaultLogger,
}) {
  if (!chatId) {
    throw new ChatNotFoundError('null id provided');
  }

  const owner = getRequestId();
  const locked = await redisMutex.lock(chatId, owner, config.llm.lockChatExpirationDelayMilliseconds);
  if (!locked) {
    throw new PromptAlreadyOngoingError(chatId);
  }

  try {
    const chat = await chatRepository.get(chatId);
    if (!chat) {
      throw new ChatNotFoundError(chatId);
    }
    if (chat.userId != undefined && userId !== chat.userId) {
      throw new ChatForbiddenError();
    }

    chat.addUserMessage(message, attachmentName);

    if (chat.shouldSendForInference) {
      llmResponseHandler.llmResponseStream = await promptRepository.prompt({
        messages: chat.messagesForInference,
        configuration: chat.configuration,
        chatId: chat.id,
      });
    }

    runFlow({ chat, owner, chatRepository, llmResponseHandler, logger, redisMutex });
  } catch (error) {
    await redisMutex.release(chatId, owner);
    throw error;
  }
}

/**
 * @function
 * @name runFlow
 *
 * @param {object} params
 * @param {Chat} params.chat
 * @param {string} params.owner - redis mutex lock owner
 * @param {ChatRepository} params.chatRepository
 * @param {RedisMutex} params.redisMutex
 * @param {LLMResponseHandler} params.llmResponseHandler
 * @param {Logger=} params.logger
 * @returns {Promise<void>}
 */
async function runFlow({ chat, owner, chatRepository, llmResponseHandler, logger = defaultLogger, redisMutex }) {
  /** @type {LLMResponseMetadata} */
  let llmResponseMetadata;
  try {
    if (chat.lastAttachmentStatus !== Chat.ATTACHMENT_STATUS.NONE) {
      await llmResponseHandler.pushAttachmentEvent(chat.lastAttachmentStatus);
    }

    llmResponseMetadata = await llmResponseHandler.processLlmResponse();
    const {
      messageParts,
      haveVictoryConditionsBeenFulfilled,
      wasModerated,
      inputTokens,
      outputTokens,
      errorOccurredDuringStream,
    } = llmResponseMetadata;

    if (errorOccurredDuringStream) {
      await llmResponseHandler.pushErrorEvent();
      throw new LLMApiError(errorOccurredDuringStream);
    }

    if (chat.lastUserMessage) {
      chat.lastUserMessage.wasModerated = wasModerated;
      if (wasModerated) {
        await llmResponseHandler.pushMessageModeratedEvent();
      }
    }

    if (haveVictoryConditionsBeenFulfilled) {
      chat.haveVictoryConditionsBeenFulfilled = true;
      await llmResponseHandler.pushVictoryConditionsSuccessEvent();
    }

    chat.updateTokenConsumption(inputTokens, outputTokens);
    if (chat.isPreview) {
      await llmResponseHandler.pushDebugEvents({ inputTokens, outputTokens });
    }

    await llmResponseHandler.finish();

    const assistantMessage = messageParts.join('');
    if (assistantMessage) {
      chat.addAssistantMessage(assistantMessage);
    }

    await chatRepository.save(chat);
  } catch (err) {
    logger.error(
      {
        err,
        context: 'prompt-chat',
        data: {
          chatId: chat.id,
          lastUserMessage: chat.lastUserMessage,
          llmResponseMetadata,
        },
      },
      'error in runFlow',
    );
    await llmResponseHandler.finish();
  } finally {
    await redisMutex.release(chat.id, owner);
  }
}
