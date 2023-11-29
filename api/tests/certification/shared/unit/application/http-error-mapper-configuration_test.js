import { expect } from '../../../../test-helper.js';
import { HttpErrors } from '../../../../../src/shared/application/http-errors.js';
import {
  CertificationCourseUpdateError,
  InvalidCertificationReportForFinalization,
} from '../../../../../src/certification/shared/domain/errors.js';
import { certificationDomainErrorMappingConfiguration } from '../../../../../src/certification/shared/application/http-error-mapper-configuration.js';
import { DomainErrorMappingConfiguration } from '../../../../../src/shared/application/models/domain-error-mapping-configuration.js';

describe('Unit | Certification | Shared | Application | HttpErrorMapperConfiguration', function () {
  it('contains a list of HttpErrorMapper instances', function () {
    // given
    // when
    // then
    certificationDomainErrorMappingConfiguration.forEach((domainErrorMappingConfiguration) =>
      expect(domainErrorMappingConfiguration).to.be.instanceOf(DomainErrorMappingConfiguration),
    );
  });

  context('when mapping "CertificationCourseUpdateError"', function () {
    it('returns an UnauthorizedError Http Error', function () {
      //given
      const httpErrorMapper = certificationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CertificationCourseUpdateError.name,
      );
      const message = 'Test message error';

      //when
      const error = httpErrorMapper.httpErrorFn(new CertificationCourseUpdateError(message));

      //then
      expect(error).to.be.instanceOf(HttpErrors.BadRequestError);
      expect(error.message).to.equal(message);
    });

    context('when mapping "InvalidCertificationReportForFinalization"', function () {
      it('returns an UnauthorizedError Http Error', function () {
        //given
        const httpErrorMapper = certificationDomainErrorMappingConfiguration.find(
          (httpErrorMapper) => httpErrorMapper.name === InvalidCertificationReportForFinalization.name,
        );
        const message = 'Test message error';

        //when
        const error = httpErrorMapper.httpErrorFn(new InvalidCertificationReportForFinalization(message));

        //then
        expect(error).to.be.instanceOf(HttpErrors.BadRequestError);
        expect(error.message).to.equal(message);
      });
    });
  });
});
