import { addCandidateToSession } from '../../../../../../src/certification/enrolment/domain/usecases/add-candidate-to-session.js';
import { CERTIFICATION_FEATURES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { CpfBirthInformationValidation } from '../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/domain/constants.js';
import {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationCandidatesError,
} from '../../../../../../src/shared/domain/errors.js';
import { CertificationCandidate } from '../../../../../../src/shared/domain/models/index.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | UseCase | add-candidate-to-session', function () {
  let sessionRepository;
  let centerRepository;
  let candidateRepository;
  let certificationCpfService;
  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;
  let complementaryCertificationRepository;
  let mailCheck;
  let normalizeStringFnc;
  let candidateToEnroll;
  let dependencies;
  const sessionId = 1;
  const cleaCertificationId = 123;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
    };
    centerRepository = {
      getById: sinon.stub(),
    };
    candidateRepository = {
      insert: sinon.stub(),
      findBySessionId: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
    complementaryCertificationRepository = {
      findAll: sinon.stub().resolves([
        domainBuilder.buildComplementaryCertification({
          id: cleaCertificationId,
          key: ComplementaryCertificationKeys.CLEA,
        }),
        domainBuilder.buildComplementaryCertification({
          id: cleaCertificationId + 5000,
          key: 'someOtherComplementaryCertification',
        }),
      ]),
    };
    mailCheck = { checkDomainIsValid: sinon.stub() };
    centerRepository.getById.resolves(
      domainBuilder.certification.enrolment.buildCenter({
        features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
      }),
    );
    normalizeStringFnc = (str) => str;
    dependencies = {
      sessionRepository,
      centerRepository,
      candidateRepository,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      complementaryCertificationRepository,
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
        certificationCenterType: CERTIFICATION_CENTER_TYPES.PRO,
      });
      sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
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
        subscription = domainBuilder.buildCoreSubscription({ certificationCandidateId: null });
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
          candidateRepository.findBySessionId
            .withArgs({ sessionId })
            .resolves([domainBuilder.certification.enrolment.buildCandidate({ ...personalInfo })]);

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
          candidateRepository.findBySessionId
            .withArgs({ sessionId })
            .resolves([domainBuilder.certification.enrolment.buildCandidate({ firstName: 'Tout autre chose' })]);
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

            it('should insert the candidate and return the ID', async function () {
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

            context('isCoreComplementaryCompatibilityEnabled is false for center', function () {
              it('should insert the candidate and return the id', async function () {
                // given
                centerRepository.getById.resolves(domainBuilder.certification.enrolment.buildCenter({}));
                candidateToEnroll.subscriptions = [
                  domainBuilder.buildCoreSubscription({
                    certificationCandidateId: null,
                  }),
                ];
                const correctedCandidateToEnroll = domainBuilder.certification.enrolment.buildCandidate({
                  ...candidateToEnroll,
                  sessionId,
                  birthCountry: 'COUNTRY',
                  birthINSEECode: 'INSEE_CODE',
                  birthPostalCode: null,
                  birthCity: 'CITY',
                  subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
                });
                candidateRepository.insert.resolves(159);

                // when
                const id = await addCandidateToSession({
                  sessionId,
                  candidate: candidateToEnroll,
                  ...dependencies,
                  isCompatibilityEnabled: false,
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
});
