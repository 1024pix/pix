import { requestResponseUtils } from '../../../shared/infrastructure/utils/request-response-utils.js';

const create = async function (request, h, { usecases, passageSerializer }) {
  const {
    'module-id': moduleId,
    'module-version': moduleVersion,
    'occurred-at': occurredAt,
    'sequence-number': sequenceNumber,
  } = request.payload.data.attributes;
  const userId = requestResponseUtils.extractUserIdFromRequest(request);
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

const verifyAndSaveAnswer = async function (request, h, { usecases, elementAnswerSerializer }) {
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

  return h
    .response({
      inputMaxChars: startedChatDTO.inputMaxChars,
      inputMaxPrompts: startedChatDTO.inputMaxPrompts,
      chatId: startedChatDTO.id,
    })
    .code(201);
};

const promptToLLMChat = async function (request, h, { usecases }) {
  const { passageId, chatId } = request.params;
  const { prompt } = request.payload;
  const userId = request.auth.credentials.userId;
  const llmResponse = await usecases.promptToLLMChat({ passageId, chatId, userId, prompt });
  return h.response(llmResponse).header('X-Accel-Buffering', 'no').type('text/event-stream; charset=utf-8').code(201);
};

const passageController = { create, verifyAndSaveAnswer, terminate, startEmbedLlmChat, promptToLLMChat };

export { passageController };
