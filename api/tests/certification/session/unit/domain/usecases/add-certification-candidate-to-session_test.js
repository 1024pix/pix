import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { addCertificationCandidateToSession } from '../../../../../../src/certification/session/domain/usecases/add-certification-candidate-to-session.js';
import { CpfBirthInformationValidation } from '../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';

import {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationCandidatesError,
} from '../../../../../../lib/domain/errors.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../lib/domain/constants/certification-candidates-errors.js';

describe('Unit | UseCase | add-certification-candidate-to-session', function () {
  let certificationCandidateRepository;
  let certificationCpfService;
  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;
  let sessionRepository;
  let mailCheck;

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
    mailCheck = { checkDomainIsValid: sinon.stub() };
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
        mailCheck,
      });

      // then
      expect(error).to.be.an.instanceOf(CertificationCandidateOnFinalizedSessionError);
      expect(error.message).to.equal("Cette session a déjà été finalisée, l'ajout de candidat n'est pas autorisé");
    });
  });

  context('when certification candidate does not pass JOI validation', function () {
    it('should throw a CertificationCandidatesError error', async function () {
      // given
      const session = domainBuilder.buildSession.created();
      sessionRepository.get.resolves(session);
      sessionRepository.isSco.resolves(false);
      const certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
        email: 'toto@toto.fr;tutu@tutu.fr',
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
        mailCheck,
      });

      // then
      expect(err).to.deepEqualInstance(
        new CertificationCandidatesError({
          code: 'CANDIDATE_EMAIL_NOT_VALID',
          meta: {
            value: 'toto@toto.fr;tutu@tutu.fr',
          },
        }),
      );
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
        mailCheck.checkDomainIsValid.resolves();

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
          mailCheck,
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
        mailCheck.checkDomainIsValid.resolves();

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
          mailCheck,
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
          mailCheck,
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
          mailCheck,
        });

        // then
        expect(certificationCandidate.validate).to.has.been.called;
      });

      context('when birth information validation fail', function () {
        it('should throw a CertificationCandidatesError', async function () {
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
            mailCheck,
          });

          // then
          expect(error).to.be.an.instanceOf(CertificationCandidatesError);
          expect(error.code).to.equal(CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED.code);
        });
      });

      context('when candidate emails validation fail', function () {
        context('when candidate convocation email is not valid', function () {
          it('should throw a CertificationCandidatesError', async function () {
            // given
            const session = domainBuilder.buildSession.created();
            sessionRepository.get.resolves(session);
            sessionRepository.isSco.resolves(false);
            const certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
              email: 'jesuisunemail@incorrect.fr',
              resultRecipientEmail: 'jesuisunemail@correct.fr',
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
            mailCheck.checkDomainIsValid.withArgs('jesuisunemail@incorrect.fr').throws();
            mailCheck.checkDomainIsValid.withArgs('jesuisunemail@correct.fr').resolves();

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
              mailCheck,
            });

            // then
            const certificationCandidatesError = new CertificationCandidatesError({
              code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EMAIL_NOT_VALID.code,
              meta: { email: 'jesuisunemail@incorrect.fr' },
            });

            expect(error).to.deepEqualInstance(certificationCandidatesError);
            expect(certificationCandidateRepository.saveInSession).not.to.have.been.called;
          });
        });

        context('when candidate recipient email is not valid', function () {
          it('should throw a CertificationCandidatesError', async function () {
            // given
            const session = domainBuilder.buildSession.created();
            sessionRepository.get.resolves(session);
            sessionRepository.isSco.resolves(false);
            const certificationCandidate = domainBuilder.buildCertificationCandidate.pro({
              resultRecipientEmail: 'jesuisunemail@incorrect.fr',
              email: 'jesuisunemail@correct.fr',
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
            mailCheck.checkDomainIsValid.withArgs('jesuisunemail@incorrect.fr').throws();
            mailCheck.checkDomainIsValid.withArgs('jesuisunemail@correct.fr').resolves();

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
              mailCheck,
            });

            // then
            const certificationCandidatesError = new CertificationCandidatesError({
              code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
              meta: { email: 'jesuisunemail@incorrect.fr' },
            });

            expect(error).to.deepEqualInstance(certificationCandidatesError);
            expect(certificationCandidateRepository.saveInSession).not.to.have.been.called;
          });
        });
      });
    });
  });
});
