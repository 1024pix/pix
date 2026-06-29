import { prescriptionDomainErrorMappingConfiguration } from '../../../../../src/prescription/shared/application/http-error-mapper-configuration.js';
import { ArchivedCampaignError } from '../../../../../src/prescription/shared/domain/errors.js';
import { PreconditionFailedError } from '../../../../../src/shared/application/errors/http-errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Prescription | Shared | Application | HttpErrorMapperConfiguration', function () {
  context('when mapping "ArchivedCampaignError"', function () {
    it('returns an PreconditionFailedError Http Error', function () {
      //given
      const httpErrorMapper = prescriptionDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === ArchivedCampaignError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new ArchivedCampaignError());

      //then
      expect(error).to.be.instanceOf(PreconditionFailedError);
      expect(error.message).to.equal('Cette campagne est déjà archivée.');
    });
  });
});
