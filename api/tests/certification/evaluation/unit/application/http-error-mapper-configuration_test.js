import { evaluationDomainErrorMappingConfiguration } from '../../../../../src/certification/evaluation/application/http-error-mapper-configuration.js';
import {
  CertificationDurationExceededError,
  NextChallengeAlreadyComputingError,
} from '../../../../../src/certification/evaluation/domain/errors.js';
import { ConflictError, LockedError } from '../../../../../src/shared/application/errors/http-errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Certification | Evaluation | Application | HttpErrorMapperConfiguration', function () {
  context('when mapping "NextChallengeAlreadyComputingError"', function () {
    it('returns an Locked Http Error', function () {
      //given
      const httpErrorMapper = evaluationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === NextChallengeAlreadyComputingError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new NextChallengeAlreadyComputingError());

      //then
      expect(error).to.be.instanceOf(LockedError);
      expect(error.message).to.equal('Une nouvelle épreuve est en cours de calcul');
    });
  });

  context('when mapping "CertificationDurationExceededError"', function () {
    it('returns a Conflict Http Error', function () {
      //given
      const httpErrorMapper = evaluationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CertificationDurationExceededError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CertificationDurationExceededError());

      //then
      expect(error).to.be.instanceOf(ConflictError);
      expect(error.message).to.equal('The maximum duration to answer the certification test has been exceeded.');
      expect(error.code).to.equal('CERTIFICATION_DURATION_EXCEEDED');
    });
  });
});
