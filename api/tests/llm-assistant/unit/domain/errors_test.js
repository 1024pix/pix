import { expect } from 'chai';

import { InferenceProviderError } from '../../../../src/llm-assistant/domain/errors.ts';
import { DomainError } from '../../../../src/shared/domain/errors.js';

describe('Llm-Assistant | Unit | Domain | errors', function () {
  describe('InferenceProviderError', function () {
    it('names the inference provider and carries the reason it gave', function () {
      // when
      const error = new InferenceProviderError('invalid api key');

      // then
      expect(error).to.be.an.instanceOf(DomainError);
      expect(error.message).to.contain('inference provider');
      expect(error.message).to.contain('invalid api key');
    });
  });
});
