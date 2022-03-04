const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const addCertificationCandidateToSession = require('../../../../lib/domain/usecases/add-certification-candidate-to-session');
const { CpfBirthInformationValidation } = require('../../../../lib/domain/services/certification-cpf-service');
const {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CpfBirthInformationValidationError,
  CertificationCandidateAddError,
} = require('../../../../lib/domain/errors');

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
      isSessionCertificationCenterScoNonManagingStudent: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
  });

  context('when certification candidate does not pass JOI validation', function () {
    it('should throw an CertificationCandidateAddError error', async function () {
      // given
      sessionRepository.isSessionCertificationCenterScoNonManagingStudent.resolves(false);
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        birthdate: 'WrongDateFormat',
        sessionId: null,
      });

      // when
      const err = await catchErr(addCertificationCandidateToSession)({
        sessionId,
        certificationCandidate,
        complementaryCertifications: [],
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
        sessionRepository.isSessionCertificationCenterScoNonManagingStudent.resolves(false);
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves(['one match']);

        // when
        const err = await catchErr(addCertificationCandidateToSession)({
          sessionId,
          certificationCandidate,
          complementaryCertifications: [],
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
      it('should save the certification candidate and the complementary certifications', async function () {
        // given
        sessionRepository.isSessionCertificationCenterScoNonManagingStudent.resolves(false);
        const complementaryCertifications = [
          domainBuilder.buildComplementaryCertification(),
          domainBuilder.buildComplementaryCertification(),
        ];
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          sessionId: null,
          complementaryCertifications,
        });
        const cpfBirthInformationValidation = CpfBirthInformationValidation.success({
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
          complementaryCertifications,
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
        sessionRepository.isSessionCertificationCenterScoNonManagingStudent.resolves(false);
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
        const cpfBirthInformationValidation = CpfBirthInformationValidation.success({
          birthCountry: 'COUNTRY',
          birthINSEECode: 'INSEE_CODE',
          birthPostalCode: null,
          birthCity: 'CITY',
          complementaryCertifications: [],
        });
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
        certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
        certificationCandidateRepository.saveInSession.resolves();

        // when
        await addCertificationCandidateToSession({
          sessionId,
          certificationCandidate,
          complementaryCertifications: [],
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
        sessionRepository.isSessionCertificationCenterScoNonManagingStudent.resolves(false);
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
        certificationCandidate.validate = sinon.stub();
        const cpfBirthInformationValidation = CpfBirthInformationValidation.success({
          birthCountry: 'COUNTRY',
          birthINSEECode: 'INSEE_CODE',
          birthPostalCode: null,
          birthCity: 'CITY',
          complementaryCertifications: [],
        });
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
        certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
        certificationCandidateRepository.saveInSession.resolves();

        // when
        await addCertificationCandidateToSession({
          sessionId,
          certificationCandidate,
          complementaryCertifications: [],
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
          sessionRepository.isSessionCertificationCenterScoNonManagingStudent.resolves(false);
          const certificationCandidate = domainBuilder.buildCertificationCandidate({
            sessionId: null,
            complementaryCertifications: [],
          });
          const cpfBirthInformationValidation = CpfBirthInformationValidation.failure('Failure message');
          certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
          certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
          certificationCandidateRepository.saveInSession.resolves();

          // when
          const error = await catchErr(addCertificationCandidateToSession)({
            sessionId,
            certificationCandidate,
            complementaryCertifications: [],
            certificationCandidateRepository,
            certificationCpfService,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
            sessionRepository,
          });

          // then
          expect(error).to.be.an.instanceOf(CpfBirthInformationValidationError);
          expect(error.message).to.equal(cpfBirthInformationValidation.message);
        });
      });
    });
  });
});
