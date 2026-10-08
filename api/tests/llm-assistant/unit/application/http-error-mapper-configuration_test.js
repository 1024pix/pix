import { expect } from 'chai';

import { llmAssistantDomainErrorMappingConfiguration } from '../../../../src/llm-assistant/application/http-error-mapper-configuration.js';
import {
  InferenceProviderError,
  InferenceProviderNotConfiguredError,
} from '../../../../src/llm-assistant/domain/errors.ts';
import { ServiceUnavailableError } from '../../../../src/shared/application/errors/http-errors.js';

describe('Llm-Assistant | Unit | Application | http-error-mapper-configuration', function () {
  it('answers 503 when the inference provider does not answer', function () {
    // given
    const error = new InferenceProviderError('invalid api key');
    const mapper = llmAssistantDomainErrorMappingConfiguration.find(({ name }) => name === InferenceProviderError.name);

    // when
    const httpError = mapper.httpErrorFn(error);

    // then
    expect(httpError).to.be.an.instanceOf(ServiceUnavailableError);
    expect(httpError.message).to.equal(error.message);
  });

  it('answers 503 when the inference provider is not configured', function () {
    // given
    const error = new InferenceProviderNotConfiguredError('LLM_ASSISTANT_MODEL');
    const mapper = llmAssistantDomainErrorMappingConfiguration.find(
      ({ name }) => name === InferenceProviderNotConfiguredError.name,
    );

    // when
    const httpError = mapper.httpErrorFn(error);

    // then
    expect(httpError).to.be.an.instanceOf(ServiceUnavailableError);
    expect(httpError.message).to.equal(error.message);
  });
});
