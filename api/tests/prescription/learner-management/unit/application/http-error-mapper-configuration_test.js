import { learnerManagementDomainErrorMappingConfiguration } from '../../../../../src/prescription/learner-management/application/http-error-mapper-configuration.js';
import {
  AggregateImportError,
  CouldNotDeleteLearnersError,
  SiecleXmlImportError,
} from '../../../../../src/prescription/learner-management/domain/errors.js';
import { HttpErrors } from '../../../../../src/shared/application/errors/http-errors.js';
import { CsvImportError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';

describe('Prescription | Learner Management | Unit | Application | HttpErrorMapperConfiguration', function () {
  it('instantiates multiple PreconditionFailedError when AggregateImportError', async function () {
    //given
    const httpErrorMapper = learnerManagementDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === AggregateImportError.name,
    );

    //when
    const error1 = new CsvImportError('ERROR_1');
    const error2 = new CsvImportError('ERROR_2');
    const error = httpErrorMapper.httpErrorFn(new AggregateImportError([error1, error2]));

    //then
    expect(error).to.be.deep.equal([
      new HttpErrors.PreconditionFailedError(error1.message, error1.code),
      new HttpErrors.PreconditionFailedError(error2.message, error2.code),
    ]);
  });

  it('instantiates PreconditionFailedError when CouldNotDeleteLearnersError', async function () {
    //given
    const httpErrorMapper = learnerManagementDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === CouldNotDeleteLearnersError.name,
    );

    //when
    const error = httpErrorMapper.httpErrorFn(new CouldNotDeleteLearnersError());

    //then
    expect(error).to.be.instanceOf(HttpErrors.PreconditionFailedError);
  });

  it('instantiates PreconditionFailedError when SiecleXmlImportError', async function () {
    //given
    const httpErrorMapper = learnerManagementDomainErrorMappingConfiguration.find(
      (httpErrorMapper) => httpErrorMapper.name === SiecleXmlImportError.name,
    );

    //when
    const error = httpErrorMapper.httpErrorFn(new SiecleXmlImportError());

    //then
    expect(error).to.be.instanceOf(HttpErrors.PreconditionFailedError);
  });
});
