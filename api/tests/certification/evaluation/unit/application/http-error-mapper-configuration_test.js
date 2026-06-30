import { evaluationDomainErrorMappingConfiguration } from '../../../../../src/certification/evaluation/application/http-error-mapper-configuration.js';
import { NextChallengeAlreadyComputingError } from '../../../../../src/certification/evaluation/domain/errors.js';
import { LockedError } from '../../../../../src/shared/application/errors/http-errors.js';
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
});
