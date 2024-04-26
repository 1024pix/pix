import { enrolmentDomainErrorMappingConfiguration } from '../../../../../src/certification/enrolment/application/http-error-mapper-configuration.js';
import { CertificationCandidateForbiddenDeletionError } from '../../../../../src/certification/enrolment/domain/errors.js';
import { HttpErrors } from '../../../../../src/shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../../../../src/shared/application/models/domain-error-mapping-configuration.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Certification | Session | Application | HttpErrorMapperConfiguration', function () {
  it('contains a list of HttpErrorMapper instances', function () {
    // given
    // when
    // then
    enrolmentDomainErrorMappingConfiguration.forEach((domainErrorMappingConfiguration) =>
      expect(domainErrorMappingConfiguration).to.be.instanceOf(DomainErrorMappingConfiguration),
    );
  });

  context('when mapping "CertificationCandidateForbiddenDeletionError"', function () {
    it('returns an CertificationCandidateForbiddenDeletionError Http Error', function () {
      //given
      const httpErrorMapper = enrolmentDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CertificationCandidateForbiddenDeletionError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CertificationCandidateForbiddenDeletionError());

      //then
      expect(error).to.be.instanceOf(HttpErrors.ForbiddenError);
      expect(error.message).to.equal(
        'Il est interdit de supprimer un candidat de certification déjà lié à un utilisateur.',
      );
    });
  });
});
