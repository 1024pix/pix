import { config } from '../../../src/shared/config.js';
import { expect } from '../../test-helper.js';

describe('LlmAssistant | Unit | Config', function () {
  describe('llmAssistant config', function () {
    it('should have llmAssistant config block defined', function () {
      expect(config.llmAssistant).to.exist;
    });

    describe('inferenceUrl', function () {
      it('should read LLM_ASSISTANT_INFERENCE_URL from env (test override)', function () {
        expect(config.llmAssistant.inferenceUrl).to.equal('https://llm-assistant-test.pix.fr/api/inference');
      });
    });

    describe('inferenceClientId', function () {
      it('should read LLM_ASSISTANT_INFERENCE_CLIENT_ID from env (test override)', function () {
        expect(config.llmAssistant.inferenceClientId).to.equal('test-client-id');
      });
    });

    describe('inferenceClientSecret', function () {
      it('should read LLM_ASSISTANT_INFERENCE_CLIENT_SECRET from env (test override)', function () {
        expect(config.llmAssistant.inferenceClientSecret).to.equal('test-client-secret');
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
