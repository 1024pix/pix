import { Readable } from 'node:stream';

import { featureToggles } from '../../../../src/shared/infrastructure/feature-toggles/index.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeaderForApplication,
  knex,
  nock,
  waitForStreamFinalizationToBeDone,
} from '../../../test-helper.js';

describe('Acceptance | Route | llm-preview', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    await featureToggles.set('isEmbedLLMEnabled', true);
  });

  describe('POST /api/llm/preview/chats', function () {
    context('when request is not authenticated', function () {
      it('should throw a 401', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/llm/preview/chats',
        });

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when application token does not have llm-preview scope', function () {
      it('should throw a 403', async function () {
        // given
        const token = generateValidRequestAuthorizationHeaderForApplication('pix-llm', 'Pix LLM', 'wrong-scope');

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/llm/preview/chats',
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when payload’s configuration is not valid', function () {
      it('should throw a 400', async function () {
        // given
        const token = generateValidRequestAuthorizationHeaderForApplication('pix-llm', 'Pix LLM', 'llm-preview');

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/llm/preview/chats',
          headers: {
            authorization: `Bearer ${token}`,
          },
          payload: {
            configuration: {
              name: 'Config de test',
              challenge: {
                inputMaxChars: 'coucou maman',
                inputMaxPrompts: 5,
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when isEmbedLLMEnabled feature toggle is false', function () {
      beforeEach(async function () {
        await featureToggles.set('isEmbedLLMEnabled', false);
      });

      it('should throw a 503', async function () {
        // given
        const token = generateValidRequestAuthorizationHeaderForApplication('pix-llm', 'Pix LLM', 'llm-preview');

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/llm/preview/chats',
          headers: {
            authorization: `Bearer ${token}`,
          },
          payload: {
            configuration: {
              name: 'Config de test',
              challenge: {
                inputMaxChars: 1024,
                inputMaxPrompts: 5,
              },
            },
          },
        });

        // then
        expect(response.statusCode).to.equal(503);
      });
    });

    it('should return a 201', async function () {
      // given
      const token = generateValidRequestAuthorizationHeaderForApplication('pix-llm', 'Pix LLM', 'llm-preview');

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/llm/preview/chats',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          configuration: {
            name: 'Config de test',
            challenge: {
              inputMaxChars: 1024,
              inputMaxPrompts: 5,
            },
            preview: {
              moderationPrompt: 'Un nouveau prompt de modération à transmettre à poc-llm',
              validationPrompt: 'Un nouveau prompt de validation à transmettre à poc-llm',
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.headers)
        .to.have.property('location')
        .that.matches(
          /^https:\/\/test\.app\.pix\.fr\/llm\/preview\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );

      const chatId = response.headers.location.split('/').at(-1);
      const chat = await knex('chats')
        .select(
          'id',
          'userId',
          'configId',
          'configContent',
          'hasAttachmentContextBeenAdded',
          'totalInputTokens',
          'totalOutputTokens',
        )
        .where({ id: chatId })
        .first();
      expect(chat).to.deep.contain({
        configContent: {
          name: 'Config de test',
          challenge: {
            inputMaxChars: 1024,
            inputMaxPrompts: 5,
          },
          preview: {
            moderationPrompt: 'Un nouveau prompt de modération à transmettre à poc-llm',
            validationPrompt: 'Un nouveau prompt de validation à transmettre à poc-llm',
          },
        },
        hasAttachmentContextBeenAdded: false,
      });
    });
  });

  describe('GET /api/llm/preview/chats/{chatId}', function () {
    context('when isEmbedLLMEnabled feature toggle is false', function () {
      beforeEach(async function () {
        await featureToggles.set('isEmbedLLMEnabled', false);
      });

      it('should throw a 503', async function () {
        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/llm/preview/embed/llm/chats/123e4567-e89b-12d3-a456-426614174000',
        });

        // then
        expect(response.statusCode).to.equal(503);
      });
    });

    context('when chatId is unknown', function () {
      it('returns status code 404', async function () {
        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/llm/preview/embed/llm/chats/00000000-0000-0000-0000-000000000000',
        });

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when chat belongs to a user', function () {
      it('returns status code 403', async function () {
        // given
        const chatId = '123e4567-e89b-12d3-a456-426614174000';
        const chat = {
          id: chatId,
          userId: 123,
          configId: 'some-config-id',
          configContent: {
            challenge: {
              inputMaxChars: 500,
              inputMaxPrompts: 4,
            },
          },
          hasAttachmentContextBeenAdded: false,
          messages: [],
        };
        await databaseBuilder.factory.buildChat(chat);
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: '/api/llm/preview/embed/llm/chats/123e4567-e89b-12d3-a456-426614174000',
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    it('returns status code 200 and chat information', async function () {
      // given
      const chatId = '123e4567-e89b-12d3-a456-426614174000';
      const messages = [
        {
          attachmentName: null,
          attachmentContext: null,
          content: 'coucou user1',
          chatId,
          emitter: 'user',
          shouldBeRenderedInPreview: true,
          index: 0,
          wasModerated: null,
        },
        {
          attachmentName: null,
          attachmentContext: null,
          content: 'coucou LLM1',
          chatId,
          emitter: 'assistant',
          index: 1,
          shouldBeRenderedInPreview: true,
          hasErrorOccurred: true,
          wasModerated: null,
        },
        {
          attachmentName: 'expected_file.txt',
          attachmentContext: null,
          chatId,
          emitter: 'user',
          index: 2,
          shouldBeRenderedInPreview: true,
          hasAttachmentBeenSubmittedAlongWithAPrompt: true,
          wasModerated: null,
        },
        {
          attachmentName: 'expected_file.txt',
          chatId,
          content: null,
          index: 3,
          attachmentContext: 'add me in the chat !',
          emitter: 'assistant',
          shouldBeRenderedInPreview: false,
          wasModerated: null,
        },
        {
          attachmentName: null,
          attachmentContext: null,
          content: 'un message',
          chatId,
          emitter: 'user',
          index: 4,
          shouldBeRenderedInPreview: true,
          haveVictoryConditionsBeenFulfilled: true,
          wasModerated: null,
        },
        {
          attachmentName: null,
          attachmentContext: null,
          chatId,
          content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
          emitter: 'assistant',
          index: 5,
          shouldBeRenderedInPreview: true,
          wasModerated: null,
        },
      ];
      const chat = {
        id: chatId,
        configContent: {
          challenge: {
            inputMaxChars: 500,
            inputMaxPrompts: 4,
            context: 'modulix',
            victoryConditions: {
              expectations: ['expectation'],
            },
          },
          attachment: {
            name: 'expected_file.txt',
            context: 'add me in the chat !',
          },
        },
        hasAttachmentContextBeenAdded: true,
        messages,
        totalInputTokens: 2_000,
        totalOutputTokens: 5_000,
      };
      await databaseBuilder.factory.buildChat(chat);
      for (const message of messages) {
        await databaseBuilder.factory.buildChatMessage(message);
      }
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/llm/preview/embed/llm/chats/123e4567-e89b-12d3-a456-426614174000',
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        id: '123e4567-e89b-12d3-a456-426614174000',
        inputMaxChars: 500,
        inputMaxPrompts: 3,
        attachmentName: 'expected_file.txt',
        context: 'modulix',
        totalInputTokens: 2_000,
        totalOutputTokens: 5_000,
        hasVictoryConditions: true,
        messages: [
          {
            content: 'coucou user1',
            attachmentName: null,
            isFromUser: true,
            isAttachmentValid: false,
            haveVictoryConditionsBeenFulfilled: false,
            wasModerated: null,
            hasErrorOccurred: null,
          },
          {
            content: 'coucou LLM1',
            attachmentName: null,
            isFromUser: false,
            isAttachmentValid: false,
            haveVictoryConditionsBeenFulfilled: false,
            wasModerated: null,
            hasErrorOccurred: true,
          },
          {
            content: 'un message',
            attachmentName: 'expected_file.txt',
            isFromUser: true,
            isAttachmentValid: true,
            haveVictoryConditionsBeenFulfilled: true,
            wasModerated: null,
            hasErrorOccurred: undefined,
          },
          {
            content: "coucou c'est super\nle couscous c plutot bon mais la paella c pas mal aussi\n",
            attachmentName: null,
            isFromUser: false,
            isAttachmentValid: false,
            haveVictoryConditionsBeenFulfilled: false,
            wasModerated: null,
            hasErrorOccurred: null,
          },
        ],
      });
    });
  });

  describe('POST /api/llm/preview/chats/{chatId}/messages', function () {
    context('when feature toggle is disabled', function () {
      beforeEach(function () {
        return featureToggles.set('isEmbedLLMEnabled', false);
      });

      it('returns a 503 status code', async function () {
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/llm/preview/embed/llm/chats/123e4567-e89b-12d3-a456-426614174000/messages',
          payload: { prompt: 'Quelle est la recette de la ratatouille ?' },
        });

        expect(response.statusCode).to.equal(503);
      });
    });

    context('when chat belongs to a user', function () {
      it('returns a 403 status code', async function () {
        // given
        await databaseBuilder.factory.buildChat({
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: 123,
          configId: 'some-config-id',
          configContent: {
            challenge: {
              inputMaxChars: 999,
              inputMaxPrompts: 999,
            },
          },
          hasAttachmentContextBeenAdded: false,
        });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/llm/preview/embed/llm/chats/123e4567-e89b-12d3-a456-426614174000/messages',
          payload: { prompt: 'Quelle est la recette de la ratatouille ?' },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    it('returns LLM response as stream', async function () {
      // given
      await databaseBuilder.factory.buildChat({
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: null,
        configId: 'some-config-id',
        configContent: {
          challenge: {
            inputMaxChars: 999,
            inputMaxPrompts: 999,
          },
          attachment: {
            name: 'expected_file.pdf',
            context: 'some context',
          },
        },
        hasAttachmentContextBeenAdded: false,
      });
      await databaseBuilder.commit();

      const promptLlmScope = nock('https://llm-test.pix.fr/api')
        .post('/chat', {
          configuration: {
            challenge: {
              inputMaxChars: 999,
              inputMaxPrompts: 999,
            },
            attachment: {
              name: 'expected_file.pdf',
              context: 'some context',
            },
          },
          history: [
            {
              content:
                "<system_notification>L'utilisateur a téléversé une pièce jointe : <attachment_name>expected_file.pdf</attachment_name></system_notification>",
              role: 'user',
            },
            {
              content:
                '<read_attachment_tool>Lecture de la pièce jointe, expected_file.pdf : <attachment_content>some context</attachment_content></read_attachment_tool>',
              role: 'assistant',
            },
          ],
          prompt: 'Quelle est la recette de la ratatouille ?',
        })
        .reply(
          201,
          Readable.from([
            '32:{"message":"coucou c\'est super"}',
            '80:{"jecrois":{"que":"jaifini"},"usage":{"input_tokens":3000,"output_tokens":5000}}',
          ]),
        );

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/llm/preview/embed/llm/chats/123e4567-e89b-12d3-a456-426614174000/messages',
        payload: { prompt: 'Quelle est la recette de la ratatouille ?', attachmentName: 'expected_file.pdf' },
      });
      await waitForStreamFinalizationToBeDone();

      // then
      expect(response.statusCode).to.equal(201);
      expect(promptLlmScope.isDone()).to.be.true;
      const attachmentMessage = 'event: attachment-success\ndata: \n\n';
      const llmMessage = "data: coucou c'est super\n\n";
      const promptsLeft = 'event: user-prompts-left\ndata: 998\n\n';
      const debugInputTokens = 'event: debug-input-tokens\ndata: 3000\n\n';
      const debugOutputTokens = 'event: debug-output-tokens\ndata: 5000\n\n';
      expect(response.result).to.deep.equal(
        attachmentMessage + llmMessage + promptsLeft + debugInputTokens + debugOutputTokens,
      );
    });
  });
});
