import { expect } from 'chai';

import { enrolmentDomainErrorMappingConfiguration } from '../../../../../src/certification/enrolment/application/http-error-mapper-configuration.js';
import {
  CannotEnrollCandidateIndividuallyError,
  CannotEnrollODSImportError,
  CannotEnrollScoCandidateError,
  CertificationCandidateForbiddenDeletionError,
  SessionStartedDeletionError,
  UnknownCountryForStudentEnrolmentError,
} from '../../../../../src/certification/enrolment/domain/errors.js';
import {
  ConflictError,
  ForbiddenError,
  PreconditionFailedError,
  UnprocessableEntityError,
} from '../../../../../src/shared/application/errors/http-errors.js';

describe('Unit | Certification | Enrolment | Application | HttpErrorMapperConfiguration', function () {
  context('when mapping "CertificationCandidateForbiddenDeletionError"', function () {
    it('returns an ForbiddenError Http Error', function () {
      //given
      const httpErrorMapper = enrolmentDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CertificationCandidateForbiddenDeletionError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CertificationCandidateForbiddenDeletionError());

      //then
      expect(error).to.be.instanceOf(ForbiddenError);
      expect(error.message).to.equal(
        'Il est interdit de supprimer un candidat de certification déjà lié à un utilisateur.',
      );
    });
  });

  context('when mapping "SessionStartedDeletionError"', function () {
    it('returns an ConflictError Http Error', function () {
      //given
      const httpErrorMapper = enrolmentDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === SessionStartedDeletionError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new SessionStartedDeletionError());

      //then
      expect(error).to.be.instanceOf(ConflictError);
      expect(error.message).to.equal('La session a déjà commencé.');
    });
  });

  context('when mapping UnknownCountryForStudentEnrolmentError', function () {
    it('returns an UnprocessableEntityError Http Error', function () {
      //given
      const httpErrorMapper = enrolmentDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === UnknownCountryForStudentEnrolmentError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(
        new UnknownCountryForStudentEnrolmentError({ firstName: 'Paul', lastName: 'Preboist' }),
      );

      //then
      expect(error).to.be.instanceOf(UnprocessableEntityError);
      expect(error.message).to.equal(
        "L'élève Paul Preboist a été inscrit avec un code pays de naissance invalide. Veuillez corriger ses informations sur l'espace PixOrga de l'établissement ou contacter le support Pix",
      );
    });
  });

  context('when mapping CannotEnrollCandidateIndividuallyError', function () {
    it('returns an PreconditionFailed Http Error', function () {
      //given
      const httpErrorMapper = enrolmentDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CannotEnrollCandidateIndividuallyError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CannotEnrollCandidateIndividuallyError());

      //then
      expect(error).to.be.instanceOf(PreconditionFailedError);
      expect(error.message).to.equal(
        "La session a été finalisée ou a expiré, l'ajout de candidat n'est plus possible.",
      );
      expect(error.code).to.equal('INDIVIDUAL_ENROL_NOT_ALLOWED');
    });
  });

  context('when mapping CannotEnrollODSImportError', function () {
    it('returns an PreconditionFailed Http Error', function () {
      //given
      const httpErrorMapper = enrolmentDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CannotEnrollODSImportError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CannotEnrollODSImportError());

      //then
      expect(error).to.be.instanceOf(PreconditionFailedError);
      expect(error.message).to.equal("La session a débuté, l'ajout de candidat n'est plus possible.");
      expect(error.code).to.equal('ODS_ENROL_NOT_ALLOWED');
    });
  });

  context('when mapping CannotEnrollScoCandidateError', function () {
    it('returns an PreconditionFailed Http Error', function () {
      //given
      const httpErrorMapper = enrolmentDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CannotEnrollScoCandidateError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CannotEnrollScoCandidateError());

      //then
      expect(error).to.be.instanceOf(PreconditionFailedError);
      expect(error.message).to.equal(
        "La session a été finalisée ou a expiré, l'ajout de candidat n'est plus possible.",
      );
      expect(error.code).to.equal('SCO_ENROL_NOT_ALLOWED');
    });
  });
});
