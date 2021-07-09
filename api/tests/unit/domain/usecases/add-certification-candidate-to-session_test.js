const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const addCertificationCandidateToSession = require('../../../../lib/domain/usecases/add-certification-candidate-to-session');
const { CpfBirthInformationValidation } = require('../../../../lib/domain/services/certification-cpf-service');
const {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  InvalidCertificationCandidate,
  CpfBirthInformationValidationError,
} = require('../../../../lib/domain/errors');
const { featureToggles } = require('../../../../lib/config');

describe('Unit | UseCase | add-certification-candidate-to-session', () => {

  let certificationCandidateRepository;
  let certificationCpfService;
  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;

  const sessionId = 1;

  beforeEach(() => {
    certificationCandidateRepository = {
      findBySessionIdAndPersonalInfo: sinon.stub(),
      saveInSession: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
  });

  context('when certification candidate does not pass JOI validation', () => {

    it('should throw an InvalidCertificationCandidate error', async () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        birthdate: 'WrongDateFormat',
        sessionId: null,
      });

      // when
      const err = await catchErr(addCertificationCandidateToSession)({
        sessionId,
        certificationCandidate,
        certificationCandidateRepository,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
      });

      // then
      expect(err).to.be.instanceOf(InvalidCertificationCandidate);
      expect(certificationCandidateRepository.saveInSession).not.to.have.been.called;
    });
  });

  context('when certification candidate is valid', () => {

    context('when a candidate already exists in session with personal info', () => {

      it('should throw an CertificationCandidateByPersonalInfoTooManyMatchesError', async () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
        certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves(['one match']);

        // when
        const err = await catchErr(addCertificationCandidateToSession)({
          sessionId,
          certificationCandidate,
          certificationCandidateRepository,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
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

    context('when no candidate exists with personal info', () => {

      it('should save the certification candidate', async () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
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
          certificationCandidateRepository,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

        // then
        expect(certificationCandidateRepository.saveInSession).to.has.been.calledWithExactly({ certificationCandidate, sessionId });
      });

      it('should return the certification candidate updated with sessionId', async () => {
        //given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
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
          certificationCandidateRepository,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

        // then
        expect(certificationCandidate.sessionId).to.equal(sessionId);
      });

      context('when isNewCpfDataEnabled toggle is enabled', () => {

        it('should validate the certification candidate with the right model version', async () => {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
          certificationCandidate.validate = sinon.stub();
          const cpfBirthInformationValidation = CpfBirthInformationValidation.success({
            birthCountry: 'COUNTRY',
            birthINSEECode: 'INSEE_CODE',
            birthPostalCode: null,
            birthCity: 'CITY',
          });
          certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
          certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
          certificationCandidateRepository.saveInSession.resolves();
          sinon.stub(featureToggles, 'isNewCPFDataEnabled').value(true);

          // when
          await addCertificationCandidateToSession({
            sessionId,
            certificationCandidate,
            certificationCandidateRepository,
            certificationCpfService,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(certificationCandidate.validate).to.has.been.calledWithExactly('1.5');
        });

        context('when birth information validation fail', () => {

          it('should throw a CpfBirthInformationValidationError', async () => {
            // given
            const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
            const cpfBirthInformationValidation = CpfBirthInformationValidation.failure('Failure message');
            certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
            certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
            certificationCandidateRepository.saveInSession.resolves();
            sinon.stub(featureToggles, 'isNewCPFDataEnabled').value(true);

            // when
            const error = await catchErr(addCertificationCandidateToSession)({
              sessionId,
              certificationCandidate,
              certificationCandidateRepository,
              certificationCpfService,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            });

            // then
            expect(error).to.be.an.instanceOf(CpfBirthInformationValidationError);
            expect(error.message).to.equal(cpfBirthInformationValidation.message);
          });
        });

      });

      context('when isNewCpfDataEnabled toggle is not enabled', () => {

        it('should validate the certification candidate with the right model version', async () => {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: null });
          certificationCandidate.validate = sinon.stub();
          const cpfBirthInformationValidation = CpfBirthInformationValidation.success({
            birthCountry: 'COUNTRY',
            birthINSEECode: 'INSEE_CODE',
            birthPostalCode: null,
            birthCity: 'CITY',
          });
          certificationCandidateRepository.findBySessionIdAndPersonalInfo.resolves([]);
          certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
          certificationCandidateRepository.saveInSession.resolves();
          sinon.stub(featureToggles, 'isNewCPFDataEnabled').value(false);

          // when
          await addCertificationCandidateToSession({
            sessionId,
            certificationCandidate,
            certificationCandidateRepository,
            certificationCpfService,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(certificationCandidate.validate).to.has.been.calledWithExactly('1.4');
        });
      });
    });
  });
});
