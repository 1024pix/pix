import { expect } from 'chai';

import { checkLLMChatIsEnabled } from '../../../../../src/llm/application/pre-handlers/index.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { useFeatureToggle } from '../../../../tooling/test-utils/use-feature-toggle.js';

describe('LLM | Unit | Application | PreHandlers', function () {
  describe('#checkLLMChatIsEnabled', function () {
    context('when feature toggle is enabled', function () {
      it('should authorize access', async function () {
        await useFeatureToggle('isEmbedLLMEnabled', true);

        const response = await checkLLMChatIsEnabled({}, hFake);

        expect(response.source).to.be.true;
      });
    });

    context('when feature toggle is disabled', function () {
      it('should not authorize access', async function () {
        await useFeatureToggle('isEmbedLLMEnabled', false);

        const response = await checkLLMChatIsEnabled({}, hFake);

        expect(response.statusCode).to.equal(503);
        expect(response.source).to.deep.equal({
          errors: [{ status: '503', title: 'ServiceUnavailable' }],
        });
      });
    });
  });
});
