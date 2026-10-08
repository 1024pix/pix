import { usecases } from '../domain/usecases/index.js';
import * as conversationSerializer from '../infrastructure/serializers/json/conversation-serializer.js';

const createOrContinueConversation = async function (request, h, dependencies = { usecases, conversationSerializer }) {
  const conversation = dependencies.conversationSerializer.deserialize(request.payload);

  const stream = await dependencies.usecases.createOrContinueConversation({ conversation });

  return h.response(stream).type('text/event-stream');
};

const llmAssistantController = { createOrContinueConversation };

export { llmAssistantController };
