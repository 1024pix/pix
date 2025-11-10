import {
  ChatForbiddenError,
  ChatNotFoundError,
  MaxPromptsReachedError,
  NoAttachmentNeededError,
  NoAttachmentNorMessageProvidedError,
  PromptAlreadyOngoingError,
  TooLargeMessageInputError,
} from '../errors.js';

/**
 * @typedef {import ('../../infrastructure/repositories/index.js').chatRepository} ChatRepository
 * @typedef {import ('../../infrastructure/repositories/index.js').promptRepository} PromptRepository
 * @typedef {import ('../../infrastructure/streaming/to-event-stream.js')} toEventStream
 * @typedef {import ('../../infrastructure/streaming/to-event-stream.js').StreamCapture} StreamCapture
 * @typedef {import ('../../../shared/infrastructure/mutex/RedisMutex.js').redisMutex} RedisMutex
 */

/**
 * @param {Object} params
 * @param {string|undefined} params.chatId
 * @param {number|undefined} params.userId
 * @param {string|undefined} params.message
 * @param {string|undefined} params.attachmentName
 * @param {ChatRepository} params.chatRepository
 * @param {PromptRepository} params.promptRepository
 * @param {toEventStream} params.toEventStream
 * @param {RedisMutex} params.redisMutex
 */
export async function promptChat({
  chatId,
  userId,
  message,
  attachmentName,
  chatRepository,
  promptRepository,
  toEventStream,
  redisMutex,
}) {
  if (!chatId) {
    throw new ChatNotFoundError('null id provided');
  }

  try {
    const locked = await redisMutex.lock(chatId);
    if (!locked) {
      throw new PromptAlreadyOngoingError(chatId);
    }
    const hasAnAttachmentBeenProvided = !!attachmentName;
    const hasAMessageBeenProvided = !!message;
    if (!hasAnAttachmentBeenProvided && !hasAMessageBeenProvided) {
      throw new NoAttachmentNorMessageProvidedError();
    }

    const chat = await chatRepository.get(chatId);

    if (!chat) {
      throw new ChatNotFoundError(chatId);
    }

    if (chat.userId != undefined && userId !== chat.userId) {
      throw new ChatForbiddenError();
    }

    const { configuration } = chat;
    if (hasAnAttachmentBeenProvided && !configuration.hasAttachment) {
      throw new NoAttachmentNeededError();
    }
    let attachmentMessageType;
    let isAttachmentValid;
    if (hasAnAttachmentBeenProvided) {
      isAttachmentValid = chat.addAttachmentContextMessages(attachmentName, message);
      attachmentMessageType = isAttachmentValid
        ? toEventStream.ATTACHMENT_MESSAGE_TYPES.IS_VALID
        : toEventStream.ATTACHMENT_MESSAGE_TYPES.IS_INVALID;
    } else {
      attachmentMessageType = toEventStream.ATTACHMENT_MESSAGE_TYPES.NONE;
    }
    let readableStream = null;
    // As long as the attachment context has been added to the chat, if we receive other attachments valid or invalid later on we must
    // forward the message to the LLM anyway
    const shouldSendMessageToLLM =
      !hasAnAttachmentBeenProvided || (hasAnAttachmentBeenProvided && chat.hasAttachmentContextBeenAdded);
    if (hasAMessageBeenProvided) {
      if (message.length > configuration.inputMaxChars) {
        throw new TooLargeMessageInputError();
      }

      if (chat.currentPromptsCount >= configuration.inputMaxPrompts) {
        throw new MaxPromptsReachedError();
      }

      if (shouldSendMessageToLLM) {
        readableStream = await promptRepository.prompt({
          message,
          chat,
        });
      }
    }

    if (message) {
      chat.addUserMessage(message, true, true, false, false);
    }

    const userPromptsLeft = configuration.inputMaxPrompts - chat.currentPromptsCount;

    return toEventStream.fromLLMResponse({
      llmResponse: readableStream,
      onStreamDone: finalize(chat, message, shouldSendMessageToLLM, chatRepository, redisMutex),
      attachmentMessageType,
      shouldSendDebugData: chat.isPreview,
      prompt: message,
      userPromptsLeft,
    });
  } catch (error) {
    await redisMutex.release(chatId);
    throw error;
  }
}

/**
 * @function
 * @name finalize
 *
 * @param {import ('../models/Chat.js').Chat} chat
 * @param {string} message
 * @param {boolean} hasJustBeenSentToLLM
 * @param {Object} chatRepository
 * @param {Object} redisMutex
 * @returns {(streamCapture: StreamCapture, hasStreamSucceeded: boolean) => Promise<void>}
 */
function finalize(chat, message, hasJustBeenSentToLLM, chatRepository, redisMutex) {
  return async (streamCapture, hasStreamSucceeded) => {
    if (hasStreamSucceeded) {
      const hasErrorOccurredDuringStream = !!streamCapture.errorOccurredDuringStream;
      if (message) {
        const shouldBeCountedAsAPrompt = hasJustBeenSentToLLM && !hasErrorOccurredDuringStream;
        const shouldBeForwardedToLLM = shouldBeCountedAsAPrompt && !streamCapture.wasModerated;
        const lastUserMessage = chat.countedMessages.at(-1);
        lastUserMessage.shouldBeCountedAsAPrompt = shouldBeCountedAsAPrompt;
        lastUserMessage.shouldBeForwardedToLLM = shouldBeForwardedToLLM;
        lastUserMessage.haveVictoryConditionsBeenFulfilled = streamCapture.haveVictoryConditionsBeenFulfilled;
        lastUserMessage.wasModerated = streamCapture.wasModerated;
      }
      chat.addLLMMessage(
        streamCapture.LLMMessageParts.join(''),
        !hasErrorOccurredDuringStream,
        hasErrorOccurredDuringStream,
      );
      chat.updateTokenConsumption(streamCapture.inputTokens, streamCapture.outputTokens);
      await chatRepository.save(chat);
    }

    await redisMutex.release(chat.id);
  };
}
