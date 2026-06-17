import sinon from 'sinon';

import { addCandidateToSession } from '../../../../../../src/certification/enrolment/domain/usecases/add-candidate-to-session.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { CertificationCandidate } from '../../../../../../src/certification/shared/domain/models/CertificationCandidate.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { CpfBirthInformationValidation } from '../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/domain/constants.js';
import {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationCandidatesError,
} from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Enrolment | Unit | UseCase | add-candidate-to-session', function () {
  let sessionRepository;
  let centerRepository;
  let candidateRepository;
  let certificationCpfService;
  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;
  let complementaryCertificationRepository;
  let eventAdapter;
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
      save: sinon.stub(),
      findBySessionId: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    eventAdapter = {
      onCandidateEnrolledIndividually: sinon.stub(),
    };
    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
    complementaryCertificationRepository = {
      findAll: sinon.stub().resolves([
        domainBuilder.certification.shared.buildComplementaryCertification({
          id: cleaCertificationId,
          key: ComplementaryCertificationKeys.CLEA,
        }),
        domainBuilder.certification.shared.buildComplementaryCertification({
          id: cleaCertificationId + 5000,
          key: 'someOtherComplementaryCertification',
        }),
      ]),
    };
    mailCheck = { assertEmailDomainHasMx: sinon.stub() };
    centerRepository.getById.resolves(domainBuilder.certification.enrolment.buildCenter());
    normalizeStringFnc = (str) => str;
    dependencies = {
      sessionRepository,
      centerRepository,
      candidateRepository,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      complementaryCertificationRepository,
      eventAdapter,
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
      expect(candidateRepository.save).not.to.have.been.called;
      expect(eventAdapter.onCandidateEnrolledIndividually).not.to.have.been.called;
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
        expect(candidateRepository.save).not.to.have.been.called;
        expect(eventAdapter.onCandidateEnrolledIndividually).not.to.have.been.called;
      });
    });

    context('when candidate is valid', function () {
      let subscription;

      beforeEach(function () {
        subscription = domainBuilder.certification.enrolment.buildCoreSubscription({ certificationCandidateId: null });
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
          expect(candidateRepository.save).not.to.have.been.called;
          expect(eventAdapter.onCandidateEnrolledIndividually).not.to.have.been.called;
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
            expect(candidateRepository.save).not.to.have.been.called;
            expect(eventAdapter.onCandidateEnrolledIndividually).not.to.have.been.called;
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
                mailCheck.assertEmailDomainHasMx.withArgs('jesuisunemail@incorrect.fr').throws();
                mailCheck.assertEmailDomainHasMx.withArgs('jesuisunemail@correct.fr').resolves();

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
                expect(candidateRepository.save).not.to.have.been.called;
                expect(eventAdapter.onCandidateEnrolledIndividually).not.to.have.been.called;
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
                mailCheck.assertEmailDomainHasMx.withArgs('jesuisunemail@incorrect.fr').throws();
                mailCheck.assertEmailDomainHasMx.withArgs('jesuisunemail@correct.fr').resolves();

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
                expect(candidateRepository.save).not.to.have.been.called;
                expect(eventAdapter.onCandidateEnrolledIndividually).not.to.have.been.called;
              });
            });
          });

          context('when emails validations succeed', function () {
            beforeEach(function () {
              mailCheck.assertEmailDomainHasMx.resolves();
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
              candidateRepository.save.resolves([correctedCandidateToEnroll]);

              // when
              const id = await addCandidateToSession({
                sessionId,
                candidate: candidateToEnroll,
                ...dependencies,
              });

              // then
              expect(candidateRepository.save).to.have.been.calledWithExactly({
                candidates: [correctedCandidateToEnroll],
              });
              expect(id).to.equal(correctedCandidateToEnroll.id);
              expect(eventAdapter.onCandidateEnrolledIndividually).to.have.been.calledWithExactly({
                candidate: correctedCandidateToEnroll,
              });
            });
          });
        });
      });
    });
  });
});
