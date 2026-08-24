import { expect } from 'chai';

import { evaluationDomainErrorMappingConfiguration } from '../../../../../src/certification/evaluation/application/http-error-mapper-configuration.js';
import {
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  CenterNotHabilitatedError,
  CertificationDurationExceededError,
  NextChallengeAlreadyComputingError,
  SessionNotJoinableError,
} from '../../../../../src/certification/evaluation/domain/errors.js';
import {
  ConflictError,
  ForbiddenError,
  LockedError,
  PreconditionFailedError,
} from '../../../../../src/shared/application/errors/http-errors.js';

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

  context('when mapping "CandidateNotAuthorizedToJoinSessionError"', function () {
    it('returns an Forbidden Http Error', function () {
      //given
      const httpErrorMapper = evaluationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CandidateNotAuthorizedToJoinSessionError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CandidateNotAuthorizedToJoinSessionError());

      //then
      expect(error).to.be.instanceOf(ForbiddenError);
      expect(error.message).to.equal(
        'Votre surveillant n’a pas confirmé votre présence dans la salle de test. Vous ne pouvez donc pas encore commencer votre test de certification. Merci de prévenir votre surveillant.',
      );
      expect(error.code).to.equal('CANDIDATE_NOT_AUTHORIZED_TO_JOIN_SESSION');
    });
  });

  context('when mapping "CandidateNotAuthorizedToResumeCertificationTestError"', function () {
    it('returns an Forbidden Http Error', function () {
      //given
      const httpErrorMapper = evaluationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CandidateNotAuthorizedToResumeCertificationTestError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CandidateNotAuthorizedToResumeCertificationTestError());

      //then
      expect(error).to.be.instanceOf(ForbiddenError);
      expect(error.message).to.equal(
        "Merci de contacter votre surveillant afin qu'il autorise la reprise de votre test.",
      );
      expect(error.code).to.equal('CANDIDATE_NOT_AUTHORIZED_TO_RESUME_SESSION');
    });
  });

  context('when mapping "SessionNotJoinable"', function () {
    it('returns an Precondition failed Http Error', function () {
      //given
      const httpErrorMapper = evaluationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === SessionNotJoinableError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new SessionNotJoinableError());

      //then
      expect(error).to.be.instanceOf(PreconditionFailedError);
      expect(error.message).to.equal('Certification session is not joinable');
      expect(error.code).to.equal('SESSION_NOT_JOINABLE');
    });
  });

  context('when mapping "CenterHabilitationError"', function () {
    it('returns an Forbidden Http Error', function () {
      //given
      const httpErrorMapper = evaluationDomainErrorMappingConfiguration.find(
        (httpErrorMapper) => httpErrorMapper.name === CenterNotHabilitatedError.name,
      );

      //when
      const error = httpErrorMapper.httpErrorFn(new CenterNotHabilitatedError());

      //then
      expect(error).to.be.instanceOf(ForbiddenError);
      expect(error.message).to.equal(
        'This certification center has no habilitation for the given complementary certification.',
      );
      expect(error.code).to.equal('CENTER_HABILITATION_ERROR');
    });
  });
});
