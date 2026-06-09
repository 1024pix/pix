import * as llmChatSerializer from '../../../shared/infrastructure/serializers/llm-chat-serializer.js';
import { extractUserIdFromRequest } from '../../../shared/infrastructure/utils/request-response-utils.js';
import * as elementAnswerSerializer from '../../infrastructure/serializers/jsonapi/element-answer-serializer.js';
import * as passageSerializer from '../../infrastructure/serializers/jsonapi/passage-serializer.js';

const create = async function (request, h, { usecases }) {
  const {
    'module-id': moduleId,
    'module-version': moduleVersion,
    'occurred-at': occurredAt,
    'sequence-number': sequenceNumber,
  } = request.payload.data.attributes;
  const userId = extractUserIdFromRequest(request);
  const passage = await usecases.createPassage({
    moduleId,
    userId,
  });

  const passageStartedData = {
    contentHash: moduleVersion,
    occurredAt: new Date(occurredAt),
    passageId: passage.id,
    sequenceNumber,
    type: 'PASSAGE_STARTED',
  };

  await usecases.recordPassageEvents({ events: [passageStartedData] });

  const serializedPassage = passageSerializer.serialize(passage);
  return h.response(serializedPassage).created();
};

const verifyAndSaveAnswer = async function (request, h, { usecases }) {
  const { passageId } = request.params;
  const { 'element-id': elementId, 'user-response': userResponse } = request.payload.data.attributes;
  const elementAnswer = await usecases.verifyAndSaveAnswer({ passageId, elementId, userResponse });
  const serializedElementAnswer = elementAnswerSerializer.serialize(elementAnswer);
  return h.response(serializedElementAnswer).created();
};

const terminate = async function (request, h, { usecases, passageSerializer }) {
  const { passageId } = request.params;
  const updatedPassage = await usecases.terminatePassage({
    passageId,
  });

  return passageSerializer.serialize(updatedPassage);
};

const startEmbedLlmChat = async function (request, h, { usecases }) {
  const { configId } = request.payload;
  const userId = request.auth.credentials.userId;
  const passageId = request.params.passageId;
  const startedChatDTO = await usecases.startEmbedLlmChat({ configId, userId, passageId });

  return h.response(llmChatSerializer.serialize(startedChatDTO)).code(201);
};

const promptToLLMChat = async function (request, h, { usecases }) {
  const { passageId, chatId } = request.params;
  const { prompt, attachmentName } = request.payload;
  const userId = request.auth.credentials.userId;
  const llmResponse = await usecases.promptToLLMChat({ passageId, chatId, userId, prompt, attachmentName });
  return h.response(llmResponse).type('text/event-stream').code(201);
};

export const passageController = { create, verifyAndSaveAnswer, terminate, startEmbedLlmChat, promptToLLMChat };
