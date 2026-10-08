import { expect } from 'chai';
import sinon from 'sinon';

import { checkLLMAssistantIsEnabled } from '../../../../../src/llm-assistant/application/pre-handlers/index.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Llm-Assistant | Unit | Application | PreHandlers', function () {
  describe('#checkLLMAssistantIsEnabled', function () {
    context('when feature toggle is enabled', function () {
      it('should authorize access', async function () {
        await featureToggles.set('isLlmAssistantEnabled', true);

        const response = await checkLLMAssistantIsEnabled({}, hFake);

        expect(response.source).to.be.true;
      });
    });

    context('when feature toggle is disabled', function () {
      it('should not authorize access', async function () {
        await featureToggles.set('isLlmAssistantEnabled', false);

        const response = await checkLLMAssistantIsEnabled({}, hFake);

        expect(response.statusCode).to.equal(503);
        expect(response.source).to.deep.equal({
          errors: [
            {
              status: '503',
              title: 'ServiceUnavailable',
              detail: 'The llm assistant is disabled by the isLlmAssistantEnabled feature toggle',
            },
          ],
        });
      });
    });

    context('when the toggle cannot be read', function () {
      it('should not authorize access either', async function () {
        sinon.stub(featureToggles, 'get').rejects(new Error('the toggle store is down'));

        const response = await checkLLMAssistantIsEnabled({}, hFake);

        expect(response.statusCode).to.equal(503);
      });
    });
  });
});
