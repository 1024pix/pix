import { editCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/edit-candidate.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { CpfBirthInformationValidation } from '../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationCandidatesError,
} from '../../../../../../src/shared/domain/errors.js';
import { CertificationCandidate } from '../../../../../../src/shared/domain/models/index.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | edit-candidate', function () {
  let sessionRepository;
  let candidateRepository;
  let enrolledCandidateRepository;
  let certificationCpfService;
  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;
  let mailCheck;
  let normalizeStringFnc;
  let candidateToEdit;
  let dependencies;
  const sessionId = 1;
  const candidateId = 1;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
      isSco: sinon.stub(),
    };
    candidateRepository = {
      update: sinon.stub(),
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

  context('when session does not allow candidate edition', function () {
    it('should throw a CertificationCandidateOnFinalizedSessionError', async function () {
      // given
      candidateToEdit = domainBuilder.certification.enrolment.buildCandidate({ id: candidateId, sessionId });
      sessionRepository.get.withArgs({ id: sessionId }).resolves(
        domainBuilder.certification.enrolment.buildSession({
          finalizedAt: new Date(),
        }),
      );
      enrolledCandidateRepository.findBySessionId
        .withArgs({ sessionId })
        .resolves([domainBuilder.certification.enrolment.buildEnrolledCandidate({ id: candidateId })]);

      // when
      const error = await catchErr(editCandidate)({
        sessionId,
        candidate: candidateToEdit,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(CertificationCandidateOnFinalizedSessionError);
      expect(error.message).to.equal("Cette session a déjà été finalisée, l'ajout de candidat n'est pas autorisé");
      expect(candidateRepository.update).not.to.have.been.called;
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
      enrolledCandidateRepository.findBySessionId
        .withArgs({ sessionId })
        .resolves([domainBuilder.certification.enrolment.buildEnrolledCandidate({ id: candidateId })]);
    });

    context('when candidate is not valid', function () {
      it('should throw a CertificationCandidatesError', async function () {
        // given
        candidateToEdit = domainBuilder.certification.enrolment.buildCandidate({
          id: candidateId,
          email: 'toto@toto.fr;tutu@tutu.fr',
        });

        // when
        const error = await catchErr(editCandidate)({
          sessionId,
          candidate: candidateToEdit,
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
        expect(candidateRepository.update).not.to.have.been.called;
      });
    });

    context('when candidate is valid', function () {
      let subscription;
      beforeEach(function () {
        subscription = domainBuilder.buildCoreSubscription({ certificationCandidateId: candidateId });
        candidateToEdit = domainBuilder.certification.enrolment.buildCandidate({
          id: candidateId,
          subscriptions: [subscription],
          billingMode: CertificationCandidate.BILLING_MODES.FREE,
          sessionId,
        });
      });

      context(
        'when a candidate that is not the one being edited but with the same personal info already enrolled in session',
        function () {
          const personalInfo = {
            firstName: 'Les',
            lastName: 'Fruits',
            birthdate: '1990-01-04',
          };

          it('should throw an CertificationCandidateByPersonalInfoTooManyMatchesError', async function () {
            // given
            candidateToEdit = domainBuilder.certification.enrolment.buildCandidate({
              ...candidateToEdit,
              ...personalInfo,
            });
            enrolledCandidateRepository.findBySessionId
              .withArgs({ sessionId })
              .resolves([
                domainBuilder.certification.enrolment.buildEnrolledCandidate({ ...personalInfo }),
                domainBuilder.certification.enrolment.buildEnrolledCandidate({ id: candidateId }),
              ]);

            // when
            const error = await catchErr(editCandidate)({
              sessionId,
              candidate: candidateToEdit,
              ...dependencies,
            });

            // then
            expect(error).to.be.instanceof(CertificationCandidateByPersonalInfoTooManyMatchesError);
            expect(candidateRepository.update).not.to.have.been.called;
          });
        },
      );

      context('when no candidate is enrolled with the same personal info', function () {
        const personalInfo = {
          firstName: 'Les',
          lastName: 'Fruits',
          birthdate: '1990-01-04',
        };
        beforeEach(function () {
          enrolledCandidateRepository.findBySessionId
            .withArgs({ sessionId })
            .resolves([
              domainBuilder.certification.enrolment.buildEnrolledCandidate({ firstName: 'Tout autre chose' }),
              domainBuilder.certification.enrolment.buildEnrolledCandidate({ id: candidateId, ...personalInfo }),
            ]);
          candidateToEdit = domainBuilder.certification.enrolment.buildCandidate({
            ...candidateToEdit,
            ...personalInfo,
          });
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
            const error = await catchErr(editCandidate)({
              sessionId,
              candidate: candidateToEdit,
              ...dependencies,
            });

            // then
            expect(error).to.be.an.instanceOf(CertificationCandidatesError);
            expect(error.code).to.equal(CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_CITY_REQUIRED.code);
            expect(candidateRepository.update).not.to.have.been.called;
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
                candidateToEdit = domainBuilder.certification.enrolment.buildCandidate({
                  ...candidateToEdit,
                  email: 'jesuisunemail@incorrect.fr',
                  resultRecipientEmail: 'jesuisunemail@correct.fr',
                });
                mailCheck.checkDomainIsValid.withArgs('jesuisunemail@incorrect.fr').throws();
                mailCheck.checkDomainIsValid.withArgs('jesuisunemail@correct.fr').resolves();

                // when
                const error = await catchErr(editCandidate)({
                  sessionId,
                  candidate: candidateToEdit,
                  ...dependencies,
                });

                // then
                const certificationCandidatesError = new CertificationCandidatesError({
                  code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EMAIL_NOT_VALID.code,
                  meta: { email: 'jesuisunemail@incorrect.fr' },
                });
                expect(error).to.deepEqualInstance(certificationCandidatesError);
                expect(candidateRepository.update).not.to.have.been.called;
              });
            });

            context('when candidate recipient email is not valid', function () {
              it('should throw a CertificationCandidatesError', async function () {
                // given
                candidateToEdit = domainBuilder.certification.enrolment.buildCandidate({
                  ...candidateToEdit,
                  createdAt: new Date('2020-01-01T00:00:00Z'),
                  email: 'jesuisunemail@correct.fr',
                  resultRecipientEmail: 'jesuisunemail@incorrect.fr',
                });
                mailCheck.checkDomainIsValid.withArgs('jesuisunemail@incorrect.fr').throws();
                mailCheck.checkDomainIsValid.withArgs('jesuisunemail@correct.fr').resolves();

                // when
                const error = await catchErr(editCandidate)({
                  sessionId,
                  candidate: candidateToEdit,
                  ...dependencies,
                });

                // then
                const certificationCandidatesError = new CertificationCandidatesError({
                  code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
                  meta: { email: 'jesuisunemail@incorrect.fr' },
                });

                expect(error).to.deepEqualInstance(certificationCandidatesError);
                expect(candidateRepository.update).not.to.have.been.called;
              });
            });
          });

          context('when emails validations succeed', function () {
            beforeEach(function () {
              mailCheck.checkDomainIsValid.resolves();
            });

            it('should update the candidate', async function () {
              // given
              const correctedCandidateToEdit = domainBuilder.certification.enrolment.buildCandidate({
                ...candidateToEdit,
                sessionId,
                birthCountry: 'COUNTRY',
                birthINSEECode: 'INSEE_CODE',
                birthPostalCode: null,
                birthCity: 'CITY',
              });
              candidateRepository.update.resolves();

              // when
              await editCandidate({
                sessionId,
                candidate: candidateToEdit,
                ...dependencies,
              });

              // then
              expect(candidateRepository.update).to.have.been.calledWithExactly(correctedCandidateToEdit);
            });
          });
        });
      });
    });
  });
});
