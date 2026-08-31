import { expect } from 'chai';
import { MockAgent, setGlobalDispatcher } from 'undici';

import { ConfigurationNotFoundError, LLMApiError } from '../../../../../src/llm/domain/errors.js';
import { get } from '../../../../../src/llm/infrastructure/repositories/configuration-repository.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('LLM | Integration | Infrastructure | Repositories | configuration', function () {
  describe('#get', function () {
    let llmApiClient;
    beforeEach(function () {
      // given
      const mockAgent = new MockAgent();
      setGlobalDispatcher(mockAgent);
      llmApiClient = mockAgent.get('https://llm-test.pix.fr');
    });

    context('error cases', function () {
      context('when no config id provided', function () {
        it('should throw a ConfigurationNotFoundError', async function () {
          // when
          const err = await catchErr(get)(null);

          // then
          expect(err).to.be.instanceOf(ConfigurationNotFoundError);
          expect(err.message).to.equal('The configuration of id "null" does not exist');
        });
      });

      context('when configuration does not exist', function () {
        it('should throw a ConfigurationNotFoundError', async function () {
          llmApiClient
            .intercept({
              path: '/api/configurations/uneConfigQuiExistePo',
              method: 'GET',
            })
            .reply(404, {});

          // when
          const err = await catchErr(get)('uneConfigQuiExistePo');

          // then
          expect(err).to.be.instanceOf(ConfigurationNotFoundError);
          expect(err.message).to.equal('The configuration of id "uneConfigQuiExistePo" does not exist');
        });
      });

      context('when something went wrong when reaching LLM Api to get configuration', function () {
        it('should retry the request 2 more times before throwing a LLMApiError', async function () {
          // given
          llmApiClient
            .intercept({
              path: '/api/configurations/unIdDeConfiguration',
              method: 'GET',
            })
            .defaultReplyHeaders({ 'Content-Type': 'application/json' })
            .reply(422, { err: 'some error occurred' })
            .times(3);

          // when
          const err = await catchErr(get)('unIdDeConfiguration');

          // then
          expect(err).to.be.instanceOf(LLMApiError);
          expect(err.message).to.equal(
            `Something went wrong when reaching the LLM Api : ${JSON.stringify({ err: 'some error occurred' }, undefined, 2)}`,
          );
        });
      });
    });

    context('success cases', function () {
      it('returns the configuration from the LLM Api', async function () {
        // given
        llmApiClient
          .intercept({
            path: '/api/configurations/unIdDeConfiguration',
            method: 'GET',
          })
          .defaultReplyHeaders({ 'Content-Type': 'application/json' })
          .reply(200, {
            challenge: { inputMaxChars: 2, inputMaxPrompts: 4 },
            attachment: { name: 'some_attachment_name', context: 'some attachment context' },
          });

        // when
        const configuration = await get('unIdDeConfiguration');

        // then
        expect(configuration).to.contain({
          inputMaxChars: 2,
          inputMaxPrompts: 3,
          attachmentName: 'some_attachment_name',
          attachmentContext: 'some attachment context',
        });
      });
    });
  });
});
