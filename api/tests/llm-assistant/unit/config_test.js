import { config } from '../../../src/shared/config.js';
import { expect } from '../../test-helper.js';

describe('LlmAssistant | Unit | Config', function () {
  describe('llmAssistant config', function () {
    it('should have llmAssistant config block defined', function () {
      expect(config.llmAssistant).to.exist;
    });

    describe('baseUrl', function () {
      it('should read LLM_ASSISTANT_BASE_URL from env (test override)', function () {
        expect(config.llmAssistant.baseUrl).to.equal('https://llm-assistant-test.pix.fr/v1');
      });
    });

    describe('apiKey', function () {
      it('should read LLM_ASSISTANT_API_KEY from env (test override)', function () {
        expect(config.llmAssistant.apiKey).to.equal('test-api-key');
      });
    });

    describe('model', function () {
      it('should read LLM_ASSISTANT_MODEL from env (test override)', function () {
        expect(config.llmAssistant.model).to.equal('test-model');
      });
    });

    describe('lmnrBaseUrl', function () {
      it('should read LMNR_BASE_URL from env (optional)', function () {
        expect(config.llmAssistant.lmnrBaseUrl).to.equal(process.env.LMNR_BASE_URL);
      });
    });

    describe('lmnrProjectApiKey', function () {
      it('should read LMNR_PROJECT_API_KEY from env (optional)', function () {
        expect(config.llmAssistant.lmnrProjectApiKey).to.equal(process.env.LMNR_PROJECT_API_KEY);
      });
    });
  });
});
