import { expect } from 'chai';
import sinon from 'sinon';

import { CannotEnrollCandidateIndividuallyError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { addCandidateToSession } from '../../../../../../src/certification/enrolment/domain/usecases/add-candidate-to-session.js';
import { BILLING_MODES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { CpfBirthInformationValidation } from '../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';
import {
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidatesError,
} from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr, preventStubsToBeCalledUnexpectedly } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Enrolment | Unit | UseCase | add-candidate-to-session', function () {
  let sessionRepository;
  let centerRepository;
  let candidateRepository;
  let certificationCpfService;
  let certificationCpfCountryRepository;
  let certificationCpfCityRepository;
  let complementaryCertificationRepository;
  let eventAdapter;
  let sessionAuthorizationAdapter;
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
    sessionAuthorizationAdapter = {
      find: sinon.stub(),
    };
    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
    complementaryCertificationRepository = {
      findAll: sinon.fake.resolves([
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

    preventStubsToBeCalledUnexpectedly([
      sessionRepository.get,
      centerRepository.getById,
      candidateRepository.findBySessionId,
      candidateRepository.save,
      certificationCpfService.getBirthInformation,
      eventAdapter.onCandidateEnrolledIndividually,
      sessionAuthorizationAdapter.find,
      mailCheck.assertEmailDomainHasMx,
    ]);

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
      sessionAuthorizationAdapter,
      mailCheck,
      normalizeStringFnc,
    };
  });

  context('when session cannot enrol any candidate', function () {
    it('should throw a CertificationCandidateOnFinalizedSessionError', async function () {
      // given
      candidateToEnroll = domainBuilder.certification.enrolment
        .candidateBuilder()
        .withParameters({ sessionId })
        .build();
      sessionAuthorizationAdapter.find
        .withArgs({ sessionId })
        .resolves(
          domainBuilder.certification.enrolment
            .sessionAuthorizationBuilder()
            .cannotEnrollCandidateIndividually()
            .build(),
        );

      // when
      const error = await catchErr(addCandidateToSession)({
        sessionId,
        candidate: candidateToEnroll,
        ...dependencies,
      });

      // then
      expect(error).to.be.an.instanceOf(CannotEnrollCandidateIndividuallyError);
      expect(error.message).to.equal(
        "La session a été finalisée ou a expiré, l'ajout de candidat n'est plus possible.",
      );
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
      sessionAuthorizationAdapter.find
        .withArgs({ sessionId })
        .resolves(
          domainBuilder.certification.enrolment.sessionAuthorizationBuilder().canEnrollCandidateIndividually().build(),
        );
    });

    context('when candidate is not valid', function () {
      it('should throw a CertificationCandidatesError', async function () {
        // given
        candidateToEnroll = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withParameters({
            email: 'toto@toto.fr;tutu@tutu.fr',
          })
          .build();

        // when
        const error = await catchErr(addCandidateToSession)({
          sessionId,
          candidate: candidateToEnroll,
          ...dependencies,
        });

        // then
        expect(error).to.be.instanceOf(CertificationCandidatesError);
        expect(error.code).to.equal('CANDIDATE_EMAIL_NOT_VALID');
        expect(error.meta).to.deep.equal({
          value: 'toto@toto.fr;tutu@tutu.fr',
        });
      });
    });

    context('when candidate is valid', function () {
      beforeEach(function () {
        candidateToEnroll = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withParameters({
            billingMode: BILLING_MODES.FREE,
          })
          .build();
      });

      context('when a candidate with the same personal info already enrolled in session', function () {
        it('should throw an CertificationCandidateByPersonalInfoTooManyMatchesError', async function () {
          // given
          candidateToEnroll = domainBuilder.certification.enrolment
            .candidateBuilder()
            .withIdentity({
              firstName: 'Les',
              lastName: 'Fruits',
              birthdate: '1990-01-04',
            })
            .withParameters({
              ...candidateToEnroll,
            })
            .build();
          candidateRepository.findBySessionId.withArgs({ sessionId }).resolves([
            domainBuilder.certification.enrolment
              .candidateBuilder()
              .withIdentity({
                firstName: 'Les',
                lastName: 'Fruits',
                birthdate: '1990-01-04',
              })
              .build(),
          ]);
          // when
          const error = await catchErr(addCandidateToSession)({
            sessionId,
            candidate: candidateToEnroll,
            ...dependencies,
          });

          // then
          expect(error).to.be.instanceof(CertificationCandidateByPersonalInfoTooManyMatchesError);
        });
      });

      context('when no candidate is enrolled with the same personal info', function () {
        beforeEach(function () {
          candidateRepository.findBySessionId
            .withArgs({ sessionId })
            .resolves([
              domainBuilder.certification.enrolment
                .candidateBuilder()
                .withIdentity({ firstName: 'Tout autre chose' })
                .build(),
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
                candidateToEnroll = domainBuilder.certification.enrolment
                  .candidateBuilder()
                  .withParameters({
                    ...candidateToEnroll,
                    email: 'jesuisunemail@incorrect.fr',
                    resultRecipientEmail: 'jesuisunemail@correct.fr',
                  })
                  .build();
                mailCheck.assertEmailDomainHasMx.withArgs('jesuisunemail@incorrect.fr').throws();
                mailCheck.assertEmailDomainHasMx.withArgs('jesuisunemail@correct.fr').resolves();

                // when
                const error = await catchErr(addCandidateToSession)({
                  sessionId,
                  candidate: candidateToEnroll,
                  ...dependencies,
                });

                // then
                expect(error).to.be.instanceOf(CertificationCandidatesError);
                expect(error.code).to.equal(CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EMAIL_NOT_VALID.code);
                expect(error.meta).to.deep.equal({ value: 'jesuisunemail@incorrect.fr' });
              });
            });

            context('when candidate recipient email is not valid', function () {
              it('should throw a CertificationCandidatesError', async function () {
                // given
                candidateToEnroll = domainBuilder.certification.enrolment
                  .candidateBuilder()
                  .withParameters({
                    ...candidateToEnroll,
                    email: 'jesuisunemail@correct.fr',
                    resultRecipientEmail: 'jesuisunemail@incorrect.fr',
                  })
                  .build();
                mailCheck.assertEmailDomainHasMx.withArgs('jesuisunemail@incorrect.fr').throws();
                mailCheck.assertEmailDomainHasMx.withArgs('jesuisunemail@correct.fr').resolves();

                // when
                const error = await catchErr(addCandidateToSession)({
                  sessionId,
                  candidate: candidateToEnroll,
                  ...dependencies,
                });

                // then
                expect(error).to.be.instanceOf(CertificationCandidatesError);
                expect(error.code).to.equal(
                  CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
                );
                expect(error.meta).to.deep.equal({ value: 'jesuisunemail@incorrect.fr' });
              });
            });
          });

          context('when emails validations succeed', function () {
            beforeEach(function () {
              mailCheck.assertEmailDomainHasMx.resolves();
            });

            it('should insert the candidate and return the ID', async function () {
              // given
              const correctedCandidateToEnroll = new Candidate({
                ...candidateToEnroll,
                sessionId,
                birthCountry: 'COUNTRY',
                birthINSEECode: 'INSEE_CODE',
                birthPostalCode: null,
                birthCity: 'CITY',
              });
              candidateRepository.save.resolves([correctedCandidateToEnroll]);
              eventAdapter.onCandidateEnrolledIndividually.resolves();

              // when
              const id = await addCandidateToSession({
                sessionId,
                candidate: candidateToEnroll,
                ...dependencies,
              });

              // then
              sinon.assert.calledWithExactly(candidateRepository.save, {
                candidates: [correctedCandidateToEnroll],
              });
              sinon.assert.calledWithExactly(eventAdapter.onCandidateEnrolledIndividually, {
                candidate: correctedCandidateToEnroll,
              });
              expect(id).to.equal(correctedCandidateToEnroll.id);
            });
          });
        });
      });
    });
  });
});
