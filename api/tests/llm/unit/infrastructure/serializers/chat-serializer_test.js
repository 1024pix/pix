import { Chat, Message } from '../../../../../src/llm/domain/models/Chat.js';
import { Configuration } from '../../../../../src/llm/domain/models/Configuration.js';
import { serialize } from '../../../../../src/llm/infrastructure/serializers/json/chat-serializer.js';

describe('LLM | Unit | Infrastructure | Serializers | Chat', function () {
  describe('serialize', function () {
    it('serializes Chat', function () {
      // given
      const chat = new Chat({
        id: '123e4567-e89b-12d3-a456-426614174000',
        configuration: new Configuration({
          challenge: {
            inputMaxChars: 500,
            inputMaxPrompts: 5,
            context: 'modulix',
          },
          attachment: {
            name: 'filename.txt',
          },
        }),
        totalInputTokens: 2_000,
        totalOutputTokens: 5_000,
        haveVictoryConditionsBeenFulfilled: true,
        messages: [
          new Message({
            index: 0,
            content: 'Salut',
            emitter: 'user',
          }),
          new Message({
            index: 1,
            content: 'Bonjour comment puis-je vous aider ?',
            emitter: 'assistant',
          }),
          new Message({
            index: 2,
            content: 'voici mon rib',
            attachmentName: 'filename.txt',
            emitter: 'user',
            wasModerated: true,
          }),
        ],
      });

      // when
      const payload = serialize(chat);

      // then
      expect(payload).to.deep.equal({
        id: '123e4567-e89b-12d3-a456-426614174000',
        attachmentName: 'filename.txt',
        inputMaxChars: 500,
        inputMaxPrompts: 4,
        hasVictoryConditions: false,
        haveVictoryConditionsBeenFulfilled: true,
        context: 'modulix',
        totalInputTokens: 2_000,
        totalOutputTokens: 5_000,
        messages: [
          {
            content: 'Salut',
            attachmentName: undefined,
            isFromUser: true,
            isAttachmentValid: false,
            wasModerated: undefined,
          },
          {
            content: 'Bonjour comment puis-je vous aider ?',
            attachmentName: undefined,
            isFromUser: false,
            isAttachmentValid: false,
            wasModerated: undefined,
          },
          {
            content: 'voici mon rib',
            attachmentName: 'filename.txt',
            isFromUser: true,
            isAttachmentValid: true,
            wasModerated: true,
          },
        ],
      });
    });
  });
});
