import { certificationDomainErrorMappingConfiguration } from '../../../../../src/certification/shared/application/http-error-mapper-configuration.js';
import {
  CenterHabilitationError,
  CertificationCandidateNotFoundError,
  CertificationCourseUpdateError,
  CsvWithNoSessionDataError,
  InvalidCertificationReportForFinalization,
} from '../../../../../src/certification/shared/domain/errors.js';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../../../src/shared/application/errors/http-errors.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Certification | Shared | Application | HttpErrorMapperConfiguration', function () {
  context('when mapping "CertificationCourseUpdateError"', function () {
    it('returns an BadRequestError Http Error', function () {
      //given
      const httpErrorMapper = certificationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CertificationCourseUpdateError.name,
      );
      const message = 'Test message error';

      //when
      const error = httpErrorMapper.httpErrorFn(new CertificationCourseUpdateError(message));

      //then
      expect(error).to.be.instanceOf(BadRequestError);
      expect(error.message).to.equal(message);
    });
  });

  context('when mapping "InvalidCertificationReportForFinalization"', function () {
    it('returns an BadRequestError Http Error', function () {
      //given
      const httpErrorMapper = certificationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === InvalidCertificationReportForFinalization.name,
      );
      const message = 'Test message error';

      //when
      const error = httpErrorMapper.httpErrorFn(new InvalidCertificationReportForFinalization(message));

      //then
      expect(error).to.be.instanceOf(BadRequestError);
      expect(error.message).to.equal(message);
    });
  });

  context('when mapping "CenterHabilitationError"', function () {
    it('returns a ForbiddenError Http Error', function () {
      //given
      const httpErrorMapper = certificationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CenterHabilitationError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CenterHabilitationError());

      //then
      expect(error).to.be.instanceOf(ForbiddenError);
      expect(error.message).to.equal(
        'This certification center has no habilitation for the given complementary certification.',
      );
      expect(error.code).to.equal('CENTER_HABILITATION_ERROR');
    });
  });

  context('when mapping "CertificationCandidateNotFoundError"', function () {
    it('returns a NotFoundError Http Error', function () {
      //given
      const httpErrorMapper = certificationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CertificationCandidateNotFoundError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CertificationCandidateNotFoundError());

      //then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('No candidate found');
      expect(error.code).to.equal('CANDIDATE_NOT_FOUND');
    });
  });

  context('when mapping "CsvWithNoSessionDataError"', function () {
    it('returns a UnprocessableEntityError Http Error', function () {
      //given
      const httpErrorMapper = certificationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CsvWithNoSessionDataError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CsvWithNoSessionDataError());

      //then
      expect(error).to.be.instanceOf(UnprocessableEntityError);
      expect(error.message).to.equal('No session data in csv');
      expect(error.code).to.equal('CSV_DATA_REQUIRED');
    });
  });
});
