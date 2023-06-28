import { expect, sinon, domainBuilder, catchErr } from '../../../../../../../tests/test-helper.js';
import { addCertificationCandidateToSession } from '../../../../../domain/session/candidate/usecases/add-certification-candidate-to-session.js';
import { CpfBirthInformationValidation } from '../../../../../../domain/services/certification-cpf-service.js';

import {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CpfBirthInformationValidationError,
  CertificationCandidateAddError,
  CertificationCandidateOnFinalizedSessionError,
} from '../../../../../../domain/errors.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../domain/constants/certification-candidates-errors.js';

describe('Unit | UseCase | add-certification-candidate-to-session', function () {
  let certificationCandidateRepository;
  let certificationCpfService;
  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;
  let sessionRepository;

  const sessionId = 1;

  beforeEach(function () {
    certificationCandidateRepository = {
      findBySessionIdAndPersonalInfo: sinon.stub(),
      saveInSession: sinon.stub(),
    };
    sessionRepository = {
      isSco: sinon.stub(),
      get: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
  });

  context('when the session is finalized', function () {
    it('should throw an CertificationCandidateOnFinalizedSessionError', async function () {
      // given
      const session = domainBuilder.buildSession.finalized();
      sessionRepository.get.resolves(session);

      const certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
        sessionId: null,
      });

      // when
      const error = await catchErr(addCertificationCandidateToSession)({
        sessionId,
        certificationCandidate,
        complementaryCertification: null,
        certificationCandidateRepository,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        sessionRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(CertificationCandidateOnFinalizedSessionError);
      expect(error.message).to.equal("Cette session a déjà été finalisée, l'ajout de candidat n'est pas autorisé");
    });
  });

  context('when certification candidate does not pass JOI validation', function () {
    it('should throw a CertificationCandidateAddError error', async function () {
      // given
      const session = domainBuilder.buildSession.created();
      sessionRepository.get.resolves(session);
      sessionRepository.isSco.resolves(false);
      const certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
        birthdate: 'WrongDateFormat',
        sessionId: null,
      });

      // when
      const err = await catchErr(addCertificationCandidateToSession)({
        sessionId,
        certificationCandidate,
        complementaryCertification: null,
        certificationCandidateRepository,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        sessionRepository,
      });

      // then
      expect(err).to.be.instanceOf(CertificationCandidateAddError);
      expect(certificationCandidateRepository.saveInSession).not.to.have.been.called;
    });
  });

  context('when certification candidate is valid', function () {
    context('when a candidate already exists in session with personal info', function () {
      it('should throw an CertificationCandidateByPersonalInfoTooManyMatchesError', async function () {
        // given
        const session = domainBuilder.buildSession.created();
        sessionRepository.get.resolves(session);
        sessionRepository.isSco.resolves(true);
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          sessionId: null,
        });
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves(['one match']);

        // when
        const err = await catchErr(addCertificationCandidateToSession)({
          sessionId,
          certificationCandidate,
          complementaryCertification: null,
          certificationCandidateRepository,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          sessionRepository,
        });

        // then
        expect(err).to.be.instanceOf(CertificationCandidateByPersonalInfoTooManyMatchesError);
        expect(certificationCandidateRepository.findBySessionIdAndPersonalInfo).to.have.been.calledWithExactly({
          sessionId,
          firstName: certificationCandidate.firstName,
          lastName: certificationCandidate.lastName,
          birthdate: certificationCandidate.birthdate,
        });
      });
    });

    context('when no candidate exists with personal info', function () {
      it('should save the certification candidate and the complementary certification', async function () {
        // given
        const session = domainBuilder.buildSession.created();
        sessionRepository.get.resolves(session);
        sessionRepository.isSco.resolves(false);
        const complementaryCertification = domainBuilder.buildComplementaryCertification();
        const certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
          sessionId: null,
          complementaryCertification,
        });
        const cpfBirthInformationValidation = new CpfBirthInformationValidation();
        cpfBirthInformationValidation.success({
          birthCountry: 'COUNTRY',
          birthINSEECode: 'INSEE_CODE',
          birthPostalCode: null,
          birthCity: 'CITY',
        });
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
        certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
        certificationCandidateRepository.saveInSession.resolves();

        // when
        await addCertificationCandidateToSession({
          sessionId,
          certificationCandidate,
          complementaryCertification,
          certificationCandidateRepository,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          sessionRepository,
        });

        // then
        expect(certificationCandidateRepository.saveInSession).to.has.been.calledWithExactly({
          certificationCandidate,
          sessionId,
        });
      });

      it('should return the certification candidate updated with sessionId', async function () {
        //given
        const session = domainBuilder.buildSession.created();
        sessionRepository.get.resolves(session);
        sessionRepository.isSco.resolves(false);
        const certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
          sessionId: null,
        });
        const cpfBirthInformationValidation = new CpfBirthInformationValidation();
        cpfBirthInformationValidation.success({
          birthCountry: 'COUNTRY',
          birthINSEECode: 'INSEE_CODE',
          birthPostalCode: null,
          birthCity: 'CITY',
          complementaryCertification: null,
        });
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
        certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
        certificationCandidateRepository.saveInSession.resolves();

        // when
        await addCertificationCandidateToSession({
          sessionId,
          certificationCandidate,
          complementaryCertification: null,
          certificationCandidateRepository,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          sessionRepository,
        });

        // then
        expect(certificationCandidate.sessionId).to.equal(sessionId);
      });

      it('should validate the certification candidate', async function () {
        // given
        const session = domainBuilder.buildSession.created();
        sessionRepository.get.resolves(session);
        sessionRepository.isSco.resolves(false);
        const certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
          sessionId: null,
        });
        certificationCandidate.validate = sinon.stub();
        const cpfBirthInformationValidation = new CpfBirthInformationValidation();
        cpfBirthInformationValidation.success({
          birthCountry: 'COUNTRY',
          birthINSEECode: 'INSEE_CODE',
          birthPostalCode: null,
          birthCity: 'CITY',
          complementaryCertification: null,
        });
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
        certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
        certificationCandidateRepository.saveInSession.resolves();

        // when
        await addCertificationCandidateToSession({
          sessionId,
          certificationCandidate,
          complementaryCertification: null,
          certificationCandidateRepository,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          sessionRepository,
        });

        // then
        expect(certificationCandidate.validate).to.has.been.called;
      });

      context('when birth information validation fail', function () {
        it('should throw a CpfBirthInformationValidationError', async function () {
          // given
          const session = domainBuilder.buildSession.created();
          sessionRepository.get.resolves(session);
          sessionRepository.isSco.resolves(false);
          const certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
            sessionId: null,
            complementaryCertification: null,
          });
          const certificationCandidateError = {
            code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED.code,
            getMessage: () => 'Failure message',
          };
          const cpfBirthInformationValidation = new CpfBirthInformationValidation();
          cpfBirthInformationValidation.failure({
            certificationCandidateError,
          });
          certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
          certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);

          // when
          const error = await catchErr(addCertificationCandidateToSession)({
            sessionId,
            certificationCandidate,
            complementaryCertification: null,
            certificationCandidateRepository,
            certificationCpfService,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
            sessionRepository,
          });

          // then
          expect(error).to.be.an.instanceOf(CpfBirthInformationValidationError);
          expect(error.code).to.equal(CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED.code);
        });
      });
    });
  });
});
