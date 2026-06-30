import { evaluationDomainErrorMappingConfiguration } from '../../../../src/evaluation/application/http-error-mapper-configuration.js';
import { AlreadyRatedAssessmentError } from '../../../../src/evaluation/domain/errors.js';
import { PreconditionFailedError } from '../../../../src/shared/application/errors/http-errors.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Evaluation | Application | HttpErrorMapperConfiguration', function () {
  context('when mapping "AlreadyRatedAssessmentError"', function () {
    it('returns an PreconditionFailedError Http Error', function () {
      // given
      const httpErrorMapper = evaluationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === AlreadyRatedAssessmentError.name,
      );

      // when
      const error = httpErrorMapper.httpErrorFn(new AlreadyRatedAssessmentError());

      // then
      expect(error).to.be.instanceOf(PreconditionFailedError);
    });
  });
});
