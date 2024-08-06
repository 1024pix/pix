import { addCandidateToSession } from '../../../../../../src/certification/enrolment/domain/usecases/add-candidate-to-session.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CpfBirthInformationValidation } from '../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationCandidatesError,
} from '../../../../../../src/shared/domain/errors.js';
import { CertificationCandidate } from '../../../../../../src/shared/domain/models/index.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | add-candidate-to-session', function () {
  let sessionRepository;
  let candidateRepository;
  let enrolledCandidateRepository;
  let certificationCpfService;
  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;
  let mailCheck;
  let normalizeStringFnc;
  let candidateToEnroll;
  let dependencies;
  const sessionId = 1;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
      isSco: sinon.stub(),
    };
    candidateRepository = {
      insert: sinon.stub(),
    };
    enrolledCandidateRepository = {
      findBySessionId: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
    mailCheck = { checkDomainIsValid: sinon.stub() };
    normalizeStringFnc = (str) => str;
    dependencies = {
      sessionRepository,
      candidateRepository,
      enrolledCandidateRepository,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      mailCheck,
      normalizeStringFnc,
    };
  });

  context('when session cannot accept any candidate', function () {
    it('should throw a CertificationCandidateOnFinalizedSessionError', async function () {
      // given
      candidateToEnroll = domainBuilder.certification.enrolment.buildCandidate({ sessionId });
      sessionRepository.get.withArgs({ id: sessionId }).resolves(
        domainBuilder.certification.enrolment.buildSession({
          finalizedAt: new Date(),
        }),
      );

      // when
      const error = await catchErr(addCandidateToSession)({
        sessionId,
        candidate: candidateToEnroll,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(CertificationCandidateOnFinalizedSessionError);
      expect(error.message).to.equal("Cette session a déjà été finalisée, l'ajout de candidat n'est pas autorisé");
      expect(candidateRepository.insert).not.to.have.been.called;
    });
  });

  context('when session can accept new candidate to enroll', function () {
    let session;

    beforeEach(function () {
      session = domainBuilder.certification.enrolment.buildSession({
        id: sessionId,
        finalizedAt: null,
      });
      sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
      sessionRepository.isSco.withArgs({ id: sessionId }).resolves(false);
    });

    context('when candidate is not valid', function () {
      it('should throw a CertificationCandidatesError', async function () {
        // given
        candidateToEnroll = domainBuilder.certification.enrolment.buildCandidate({
          email: 'toto@toto.fr;tutu@tutu.fr',
        });

        // when
        const error = await catchErr(addCandidateToSession)({
          sessionId,
          candidate: candidateToEnroll,
          ...dependencies,
        });

        // then
        expect(error).to.deepEqualInstance(
          new CertificationCandidatesError({
            code: 'CANDIDATE_EMAIL_NOT_VALID',
            meta: {
              value: 'toto@toto.fr;tutu@tutu.fr',
            },
          }),
        );
        expect(candidateRepository.insert).not.to.have.been.called;
      });
    });

    context('when candidate is valid', function () {
      let subscription;
      beforeEach(function () {
        subscription = {
          type: SUBSCRIPTION_TYPES.CORE,
          complementaryCertificationId: null,
          complementaryCertificationLabel: null,
          complementaryCertificationKey: null,
        };
        candidateToEnroll = domainBuilder.certification.enrolment.buildCandidate({
          subscriptions: [subscription],
          billingMode: CertificationCandidate.BILLING_MODES.FREE,
        });
      });

      context('when a candidate with the same personal info already enrolled in session', function () {
        const personalInfo = {
          firstName: 'Les',
          lastName: 'Fruits',
          birthdate: '1990-01-04',
        };

        it('should throw an CertificationCandidateByPersonalInfoTooManyMatchesError', async function () {
          // given
          candidateToEnroll = domainBuilder.certification.enrolment.buildCandidate({
            ...candidateToEnroll,
            ...personalInfo,
          });
          enrolledCandidateRepository.findBySessionId
            .withArgs({ sessionId })
            .resolves([domainBuilder.certification.enrolment.buildEnrolledCandidate({ ...personalInfo })]);

          // when
          const error = await catchErr(addCandidateToSession)({
            sessionId,
            candidate: candidateToEnroll,
            ...dependencies,
          });

          // then
          expect(error).to.be.instanceof(CertificationCandidateByPersonalInfoTooManyMatchesError);
          expect(candidateRepository.insert).not.to.have.been.called;
        });
      });

      context('when no candidate is enrolled with the same personal info', function () {
        beforeEach(function () {
          enrolledCandidateRepository.findBySessionId
            .withArgs({ sessionId })
            .resolves([
              domainBuilder.certification.enrolment.buildEnrolledCandidate({ firstName: 'Tout autre chose' }),
            ]);
        });

        context('when birth information validation fails', function () {
          it('should throw a CertificationCandidatesError', async function () {
            // given
            const certificationCandidateError = {
              code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED.code,
              getMessage: () => 'Failure message',
            };
            const cpfBirthInformationValidation = new CpfBirthInformationValidation();
            cpfBirthInformationValidation.failure({
              certificationCandidateError,
            });
            certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);

            // when
            const error = await catchErr(addCandidateToSession)({
              sessionId,
              candidate: candidateToEnroll,
              ...dependencies,
            });

            // then
            expect(error).to.be.an.instanceOf(CertificationCandidatesError);
            expect(error.code).to.equal(CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED.code);
            expect(candidateRepository.insert).not.to.have.been.called;
          });
        });

        context('when birth information validation succeeds', function () {
          beforeEach(function () {
            const cpfBirthInformationValidation = new CpfBirthInformationValidation();
            cpfBirthInformationValidation.success({
              birthCountry: 'COUNTRY',
              birthINSEECode: 'INSEE_CODE',
              birthPostalCode: null,
              birthCity: 'CITY',
            });
            certificationCpfService.getBirthInformation.resolves(cpfBirthInformationValidation);
          });

          context('when candidate emails validation fails', function () {
            context('when candidate convocation email is not valid', function () {
              it('should throw a CertificationCandidatesError', async function () {
                // given
                candidateToEnroll = domainBuilder.certification.enrolment.buildCandidate({
                  ...candidateToEnroll,
                  email: 'jesuisunemail@incorrect.fr',
                  resultRecipientEmail: 'jesuisunemail@correct.fr',
                });
                mailCheck.checkDomainIsValid.withArgs('jesuisunemail@incorrect.fr').throws();
                mailCheck.checkDomainIsValid.withArgs('jesuisunemail@correct.fr').resolves();

                // when
                const error = await catchErr(addCandidateToSession)({
                  sessionId,
                  candidate: candidateToEnroll,
                  ...dependencies,
                });

                // then
                const certificationCandidatesError = new CertificationCandidatesError({
                  code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EMAIL_NOT_VALID.code,
                  meta: { email: 'jesuisunemail@incorrect.fr' },
                });
                expect(error).to.deepEqualInstance(certificationCandidatesError);
                expect(candidateRepository.insert).not.to.have.been.called;
              });
            });

            context('when candidate recipient email is not valid', function () {
              it('should throw a CertificationCandidatesError', async function () {
                // given
                candidateToEnroll = domainBuilder.certification.enrolment.buildCandidate({
                  ...candidateToEnroll,
                  email: 'jesuisunemail@correct.fr',
                  resultRecipientEmail: 'jesuisunemail@incorrect.fr',
                });
                mailCheck.checkDomainIsValid.withArgs('jesuisunemail@incorrect.fr').throws();
                mailCheck.checkDomainIsValid.withArgs('jesuisunemail@correct.fr').resolves();

                // when
                const error = await catchErr(addCandidateToSession)({
                  sessionId,
                  candidate: candidateToEnroll,
                  ...dependencies,
                });

                // then
                const certificationCandidatesError = new CertificationCandidatesError({
                  code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
                  meta: { email: 'jesuisunemail@incorrect.fr' },
                });

                expect(error).to.deepEqualInstance(certificationCandidatesError);
                expect(candidateRepository.insert).not.to.have.been.called;
              });
            });
          });

          context('when emails validations succeed', function () {
            beforeEach(function () {
              mailCheck.checkDomainIsValid.resolves();
            });

            it('should insert the candidate and returns the ID', async function () {
              // given
              const correctedCandidateToEnroll = domainBuilder.certification.enrolment.buildCandidate({
                ...candidateToEnroll,
                sessionId,
                birthCountry: 'COUNTRY',
                birthINSEECode: 'INSEE_CODE',
                birthPostalCode: null,
                birthCity: 'CITY',
              });
              candidateRepository.insert.resolves(159);

              // when
              const id = await addCandidateToSession({
                sessionId,
                candidate: candidateToEnroll,
                ...dependencies,
              });

              // then
              expect(candidateRepository.insert).to.have.been.calledWithExactly(correctedCandidateToEnroll);
              expect(id).to.equal(159);
            });
          });
        });
      });
    });
  });
});
