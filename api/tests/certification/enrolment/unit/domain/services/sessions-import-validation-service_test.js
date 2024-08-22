import lodash from 'lodash';

import * as sessionsImportValidationService from '../../../../../../src/certification/enrolment/domain/services/sessions-import-validation-service.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { CpfBirthInformationValidation } from '../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const { noop } = lodash;

describe('Unit | Service | sessions import validation Service', function () {
  describe('#validateSession', function () {
    let clock;
    let sessionRepository;
    let sessionManagementRepository;

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: new Date('2023-01-01'),
        toFake: ['Date'],
      });
      sessionRepository = {
        isSessionExistingByCertificationCenterId: sinon.stub(),
        isSessionExistingBySessionAndCertificationCenterIds: sinon.stub(),
      };
      sessionManagementRepository = { hasNoStartedCertification: sinon.stub() };
    });

    afterEach(async function () {
      clock.restore();
    });

    context('when the parsed data is valid', function () {
      context('when the session has not started yet', function () {
        context('when there is no sessionId', function () {
          it('should return an empty sessionErrors array', async function () {
            // given
            const certificationCenterId = domainBuilder.buildCertificationCenter({}).id;
            const session = _buildValidSessionWithoutId();
            sessionRepository.isSessionExistingByCertificationCenterId
              .withArgs({ ...session, certificationCenterId })
              .resolves(false);

            // when
            const sessionErrors = await sessionsImportValidationService.validateSession({
              session,
              candidatesData: [_buildValidCandidateData()],
              line: 1,
              sessionRepository,
              sessionManagementRepository,
            });

            // then
            expect(sessionErrors).to.be.empty;
          });
        });

        context('when there is a sessionId', function () {
          describe('when sessionId is not valid', function () {
            it('should return a sessionErrors array that contains a sessionId invalid format error', async function () {
              // given
              const session = _buildValidSessionWithId();
              session.id = 'toto123$';

              // when
              const sessionErrors = await sessionsImportValidationService.validateSession({
                session,
                candidatesData: [_buildValidCandidateData()],
                line: 1,
                sessionRepository,
                sessionManagementRepository,
              });

              // then
              expect(sessionManagementRepository.hasNoStartedCertification).to.not.have.been.called;
              expect(sessionErrors).to.deep.equal([
                {
                  line: 1,
                  code: 'SESSION_ID_NOT_VALID',
                  isBlocking: true,
                },
              ]);
            });
          });

          describe('when sessionId is valid', function () {
            it('should return an empty sessionErrors array', async function () {
              // given
              const sessionId = 1;
              const session = _buildValidSessionWithId(sessionId);
              sessionManagementRepository.hasNoStartedCertification.resolves(true);
              sessionRepository.isSessionExistingBySessionAndCertificationCenterIds.resolves(true);

              // when
              const sessionErrors = await sessionsImportValidationService.validateSession({
                session,
                candidatesData: [_buildValidCandidateData()],
                line: 1,
                sessionRepository,
                sessionManagementRepository,
              });

              // then
              expect(sessionErrors).to.be.empty;
            });
          });
        });
      });
    });

    context('when the session has already started', function () {
      it('should return an errorReport that contains an already started error', async function () {
        const session = _buildValidSessionWithId(1234);
        sessionManagementRepository.hasNoStartedCertification.withArgs({ id: 1234 }).resolves(false);
        sessionRepository.isSessionExistingBySessionAndCertificationCenterIds.resolves(true);

        // when
        const sessionErrors = await sessionsImportValidationService.validateSession({
          session,
          candidatesData: [_buildValidCandidateData()],
          line: 2,
          sessionRepository,
          sessionManagementRepository,
        });

        // then
        expect(sessionErrors).to.deep.equal([
          {
            line: 2,
            code: 'CANDIDATE_NOT_ALLOWED_FOR_STARTED_SESSION',
            isBlocking: true,
          },
        ]);
      });
    });

    context('date validation', function () {
      context('when at least one session is scheduled in the past', function () {
        it('should return a sessionErrors array that contains a no session scheduled in the past error', async function () {
          // given
          const session = _buildValidSessionWithoutId();
          session.date = '2020-03-12';

          // when
          const sessionErrors = await sessionsImportValidationService.validateSession({
            session,
            candidatesData: [_buildValidCandidateData()],
            line: 1,
            sessionRepository,
            sessionManagementRepository,
          });

          // then
          expect(sessionErrors).to.deep.equal([
            {
              line: 1,
              code: 'SESSION_SCHEDULED_IN_THE_PAST',
              isBlocking: true,
            },
          ]);
        });
      });
    });

    context('when a session id is given', function () {
      context('when the session exist for the certification center', function () {
        context('conflicting session information validation', function () {
          context('when there is a sessionId and session information', function () {
            it('should return a sessionErrors array that contains an already given ID error', async function () {
              // given
              const session = _buildValidSessionWithoutId();
              session.id = 1234;
              sessionManagementRepository.hasNoStartedCertification.withArgs({ id: 1234 }).resolves(true);
              sessionRepository.isSessionExistingBySessionAndCertificationCenterIds.resolves(true);

              // when
              const sessionErrors = await sessionsImportValidationService.validateSession({
                session,
                candidatesData: [_buildValidCandidateData()],
                line: 1,
                sessionRepository,
                sessionManagementRepository,
              });

              // then
              expect(sessionErrors).to.deep.equal([
                {
                  line: 1,
                  code: 'INFORMATION_NOT_ALLOWED_WITH_SESSION_ID',
                  isBlocking: true,
                },
              ]);
            });
          });
        });
      });
      context('when the session does not exist for the certification center', function () {
        it('should return a sessionErrors array that contains a non-existent session id error', async function () {
          // given
          const certificationCenter = domainBuilder.buildCertificationCenter();
          const session = domainBuilder.certification.enrolment.buildSession({
            id: 1234,
            address: null,
            room: null,
            date: null,
            time: null,
            examiner: null,
            description: null,
            certificationCenterId: certificationCenter.id,
            certificationCandidates: [],
          });
          sessionRepository.isSessionExistingBySessionAndCertificationCenterIds
            .withArgs({ sessionId: 5678, certificationCenterId: certificationCenter.id, sessionRepository })
            .resolves(false);

          // when
          const sessionErrors = await sessionsImportValidationService.validateSession({
            session,
            candidatesData: [_buildValidCandidateData()],
            certificationCenterId: certificationCenter.id,
            line: 1,
            sessionRepository,
            sessionManagementRepository,
          });

          // then
          expect(sessionErrors).to.deep.equal([
            {
              line: 1,
              code: 'SESSION_ID_NOT_EXISTING',
              isBlocking: true,
            },
          ]);
        });
      });
    });

    context('when there is session information but no sessionId', function () {
      it('should return an empty sessionErrors array', async function () {
        const session = domainBuilder.certification.enrolment.buildSession({
          ..._createValidSessionData(),
          id: null,
        });

        // when
        const sessionErrors = await sessionsImportValidationService.validateSession({
          session,
          candidatesData: [_buildValidCandidateData()],
          line: 1,
          sessionRepository,
          sessionManagementRepository,
        });

        // then
        expect(sessionErrors).to.be.empty;
      });
    });

    context('when there already is an existing session with the same data as a newly imported one', function () {
      it('should return a sessionErrors array that contains a session already existing error', async function () {
        // given
        const certificationCenterId = domainBuilder.buildCertificationCenter({}).id;
        const session = _buildValidSessionWithoutId();
        sessionRepository.isSessionExistingByCertificationCenterId
          .withArgs({ ...session, certificationCenterId })
          .resolves(true);

        // when
        const sessionErrors = await sessionsImportValidationService.validateSession({
          session,
          candidatesData: [_buildValidCandidateData()],
          line: 1,
          certificationCenterId,
          sessionRepository,
          sessionManagementRepository,
        });

        // then
        expect(sessionErrors).to.deep.equal([
          {
            line: 1,
            code: 'SESSION_WITH_DATE_AND_TIME_ALREADY_EXISTS',
            isBlocking: true,
          },
        ]);
      });
    });

    describe('when session date is not valid', function () {
      it('should return a sessionErrors array that contains a session invalid date format error', async function () {
        // given
        const session = _buildValidSessionWithoutId();
        session.date = 'toto';

        // when
        const sessionErrors = await sessionsImportValidationService.validateSession({
          session,
          candidatesData: [_buildValidCandidateData()],
          line: 1,
          sessionRepository,
          sessionManagementRepository,
        });

        // then
        expect(sessionRepository.isSessionExistingByCertificationCenterId).to.not.have.been.called;
        expect(sessionErrors).to.deep.equal([
          {
            line: 1,
            code: 'SESSION_DATE_NOT_VALID',
            isBlocking: true,
          },
        ]);
      });
    });

    describe('when session time is not valid', function () {
      it('should return a sessionErrors array that contains a invalid time format error', async function () {
        // given
        const session = _buildValidSessionWithoutId();
        session.time = 'toto';

        // when
        const sessionErrors = await sessionsImportValidationService.validateSession({
          session,
          candidatesData: [_buildValidCandidateData()],
          line: 1,
          sessionRepository,
          sessionManagementRepository,
        });

        // then
        expect(sessionRepository.isSessionExistingByCertificationCenterId).to.not.have.been.called;
        expect(sessionErrors).to.deep.equal([
          {
            line: 1,
            code: 'SESSION_TIME_NOT_VALID',
            isBlocking: true,
          },
        ]);
      });
    });

    context('when session has one invalid field', function () {
      it('should return a sessionErrors array that contains a session invalid field error', async function () {
        // given
        const session = _buildValidSessionWithoutId();
        session.room = null;

        // when
        const sessionErrors = await sessionsImportValidationService.validateSession({
          session,
          candidatesData: [_buildValidCandidateData()],
          line: 1,
          sessionRepository,
          sessionManagementRepository,
        });

        // then
        expect(sessionErrors).to.deep.equal([
          {
            line: 1,
            code: 'SESSION_ROOM_REQUIRED',
            isBlocking: true,
          },
        ]);
      });
    });

    context('when session has more than one invalid fields', function () {
      it('should return a sessionErrors array that contains all session errors', async function () {
        // given
        const session = _buildValidSessionWithoutId();
        session.room = null;
        session.address = null;

        // when
        const sessionErrors = await sessionsImportValidationService.validateSession({
          session,
          candidatesData: [_buildValidCandidateData()],
          line: 1,
          sessionRepository,
          sessionManagementRepository,
        });

        // then
        expect(sessionErrors).to.have.deep.members([
          { line: 1, code: 'SESSION_ADDRESS_REQUIRED', isBlocking: true },
          { line: 1, code: 'SESSION_ROOM_REQUIRED', isBlocking: true },
        ]);
      });
    });

    context('when session has no candidates', function () {
      it('should return a non blocking sessionError', async function () {
        // given
        const session = _buildValidSessionWithoutId();

        // when
        const sessionErrors = await sessionsImportValidationService.validateSession({
          session,
          candidatesData: [],
          line: 1,
          sessionRepository,
          sessionManagementRepository,
        });

        // then
        expect(sessionErrors).to.have.deep.members([{ line: 1, code: 'EMPTY_SESSION', isBlocking: false }]);
      });
    });
  });

  context('#validateCandidateEmails', function () {
    context('when result recipient email has invalid domain', function () {
      it('should return a blocking certificationCandidateError', async function () {
        // given
        const certificationCandidate = _buildValidCandidateData();
        const mailCheckStub = {
          checkDomainIsValid: sinon.stub().throws(),
        };

        // when
        const sessionErrors = await sessionsImportValidationService.validateCandidateEmails({
          candidate: certificationCandidate,
          line: 1,
          dependencies: { mailCheck: mailCheckStub },
        });

        // then
        expect(sessionErrors).to.have.deep.members([
          { line: 1, code: 'CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID', isBlocking: true },
          { line: 1, code: 'CANDIDATE_EMAIL_NOT_VALID', isBlocking: true },
        ]);
      });
    });
    context('when result recipient email has valid domain', function () {
      it('should return an empty certificationCandidateErrors', async function () {
        // given
        const certificationCandidate = _buildValidCandidateData();
        const mailCheckStub = {
          checkDomainIsValid: sinon.stub().resolves(),
        };

        // when
        const sessionErrors = await sessionsImportValidationService.validateCandidateEmails({
          candidate: certificationCandidate,
          line: 1,
          dependencies: { mailCheck: mailCheckStub },
        });

        // then
        expect(sessionErrors).to.be.empty;
      });
    });
  });

  describe('#getValidatedSubscriptionsForMassImport', function () {
    let isCoreComplementaryCompatibilityEnabled;
    context('isCoreComplementaryCompatibilityEnabled false', function () {
      beforeEach(function () {
        isCoreComplementaryCompatibilityEnabled = false;
      });
      context('when there are no subscriptions at all', function () {
        it('should return an error accordingly and no subscriptions models', async function () {
          // given
          const subscriptionLabels = [];
          const line = 12;

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository: {},
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.deep.equal([
            {
              code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_NO_SUBSCRIPTION.code,
              line,
              isBlocking: true,
            },
          ]);
          expect(subscriptions).to.be.empty;
        });
      });
      context('when there is a complementary subscription without core', function () {
        it('should return an error accordingly and no subscriptions models', async function () {
          // given
          const subscriptionLabels = ['MaComplémentaire'];
          const line = 12;
          const complementaryCertificationRepository = {
            getByLabel: sinon
              .stub()
              .withArgs({ label: 'MaComplémentaire' })
              .resolves({ id: 3, key: 'SOME_KEY', label: 'MaComplémentaire' }),
          };

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository,
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.deep.equal([
            {
              code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_COMPLEMENTARY_WITHOUT_CORE.code,
              line,
              isBlocking: true,
            },
          ]);
          expect(subscriptions).to.be.empty;
        });
      });
      context('when there are many complementary subscriptions', function () {
        it('should return an error accordingly and no subscriptions models', async function () {
          // given
          const subscriptionLabels = ['MaComplémentaire1', 'MaComplémentaire2', SUBSCRIPTION_TYPES.CORE];
          const line = 12;
          const complementaryCertificationRepository = {
            getByLabel: sinon.stub(),
          };
          complementaryCertificationRepository.getByLabel
            .withArgs({ label: 'MaComplémentaire1' })
            .resolves({ id: 3, key: 'SOME_KEY1', label: 'MaComplémentaire1' });
          complementaryCertificationRepository.getByLabel
            .withArgs({ label: 'MaComplémentaire2' })
            .resolves({ id: 4, key: 'SOME_KEY2', label: 'MaComplémentaire2' });

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository,
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.deep.equal([
            {
              code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION.code,
              line,
              isBlocking: true,
            },
          ]);
          expect(subscriptions).to.be.empty;
        });
      });
      context('when there is only a core subscription', function () {
        it('should return no error and a core subscription', async function () {
          // given
          const subscriptionLabels = [SUBSCRIPTION_TYPES.CORE];
          const line = 12;

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository: {},
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.be.empty;
          expect(subscriptions).to.deepEqualArray([
            domainBuilder.buildCoreSubscription({ certificationCandidateId: null }),
          ]);
        });
      });
      context('when there are a core and a complementary subscriptions', function () {
        it('should return no error and the right subscriptions', async function () {
          // given
          const subscriptionLabels = [SUBSCRIPTION_TYPES.CORE, 'MaComplémentaire'];
          const line = 12;
          const complementaryCertificationRepository = {
            getByLabel: sinon.stub(),
          };
          complementaryCertificationRepository.getByLabel
            .withArgs({ label: 'MaComplémentaire' })
            .resolves({ id: 3, key: 'SOME_KEY', label: 'MaComplémentaire' });

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository,
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.be.empty;
          expect(subscriptions).to.deepEqualArray([
            domainBuilder.buildCoreSubscription({ certificationCandidateId: null }),
            domainBuilder.buildComplementarySubscription({
              certificationCandidateId: null,
              complementaryCertificationId: 3,
            }),
          ]);
        });
      });
    });

    context('isCoreComplementaryCompatibilityEnabled true', function () {
      const notCleaComplementaryCertificationId = 111,
        notCleaComplementaryCertificationLabel = 'PAS CLEA';
      const cleaComplementaryCertificationId = 222,
        cleaComplementaryCertificationLabel = 'CLEA';
      const reallyNotCleaComplementaryCertificationId = 333,
        reallyNotCleaComplementaryCertificationLabel = 'VRAIMENT PAS CLEA';
      let complementaryCertificationRepository;

      beforeEach(function () {
        isCoreComplementaryCompatibilityEnabled = true;
        const complementaryCertifications = [
          domainBuilder.buildComplementaryCertification({
            id: notCleaComplementaryCertificationId,
            label: notCleaComplementaryCertificationLabel,
            key: 'someKey',
          }),
          domainBuilder.buildComplementaryCertification({
            id: cleaComplementaryCertificationId,
            label: cleaComplementaryCertificationLabel,
            key: ComplementaryCertificationKeys.CLEA,
          }),
          domainBuilder.buildComplementaryCertification({
            id: reallyNotCleaComplementaryCertificationId,
            label: reallyNotCleaComplementaryCertificationLabel,
            key: 'someOtherKey',
          }),
        ];
        complementaryCertificationRepository = {
          findAll: sinon.stub().resolves(complementaryCertifications),
        };
      });

      context('success cases', function () {
        it('should return valid core subscription when only core submitted', async function () {
          // given
          const subscriptionLabels = [SUBSCRIPTION_TYPES.CORE];
          const line = 12;

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository,
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.be.empty;
          expect(subscriptions).to.deepEqualArray([
            domainBuilder.buildCoreSubscription({ certificationCandidateId: null }),
          ]);
        });

        it('should return valid core/clea subscriptions when clea submitted', async function () {
          // given
          const subscriptionLabels = [cleaComplementaryCertificationLabel];
          const line = 12;

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository,
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.be.empty;
          expect(subscriptions).to.deepEqualArray([
            domainBuilder.buildCoreSubscription({ certificationCandidateId: null }),
            domainBuilder.buildComplementarySubscription({
              certificationCandidateId: null,
              complementaryCertificationId: cleaComplementaryCertificationId,
            }),
          ]);
        });

        it('should return valid complementary subscription when only complementary not clea submitted', async function () {
          // given
          const subscriptionLabels = [notCleaComplementaryCertificationLabel];
          const line = 12;

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository,
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.be.empty;
          expect(subscriptions).to.deepEqualArray([
            domainBuilder.buildComplementarySubscription({
              certificationCandidateId: null,
              complementaryCertificationId: notCleaComplementaryCertificationId,
            }),
          ]);
        });
      });

      context('ko cases', function () {
        it('should return an error when there are no subscription at all', async function () {
          // given
          const subscriptionLabels = [];
          const line = 12;

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository,
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.deep.equal([
            {
              code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_NO_SUBSCRIPTION.code,
              line,
              isBlocking: true,
            },
          ]);
          expect(subscriptions).to.be.empty;
        });

        it('should return an error when there are two complementary (neither clea)', async function () {
          // given
          const subscriptionLabels = [
            notCleaComplementaryCertificationLabel,
            reallyNotCleaComplementaryCertificationLabel,
          ];
          const line = 12;

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository,
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.deep.equal([
            {
              code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION.code,
              line,
              isBlocking: true,
            },
          ]);
          expect(subscriptions).to.be.empty;
        });

        it('should return an error when there are two complementary (one clea)', async function () {
          // given
          const subscriptionLabels = [
            cleaComplementaryCertificationLabel,
            reallyNotCleaComplementaryCertificationLabel,
          ];
          const line = 12;

          // when
          const { certificationCandidateComplementaryErrors, subscriptions } =
            await sessionsImportValidationService.getValidatedSubscriptionsForMassImport({
              subscriptionLabels,
              line,
              complementaryCertificationRepository,
              isCoreComplementaryCompatibilityEnabled,
            });

          // then
          expect(certificationCandidateComplementaryErrors).to.deep.equal([
            {
              code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION.code,
              line,
              isBlocking: true,
            },
          ]);
          expect(subscriptions).to.be.empty;
        });
      });
    });
  });

  describe('#getValidatedCandidateBirthInformation', function () {
    context('when the parsed data is valid', function () {
      it('should return an empty certificationCandidateErrors', async function () {
        // given
        const candidateInformation = {
          birthCountry: 'Pérou',
          birthCity: 'Pétaouchnok',
          birthPostalCode: '44329',
          birthINSEECode: '67890',
        };
        const candidate = _buildValidCandidateModel();
        const cpfBirthInformationValidation = new CpfBirthInformationValidation();
        cpfBirthInformationValidation.success(candidateInformation);
        const certificationCpfServiceStub = {
          getBirthInformation: sinon.stub().resolves(cpfBirthInformationValidation),
        };

        // when
        const { certificationCandidateErrors } =
          await sessionsImportValidationService.getValidatedCandidateBirthInformation({
            candidate,
            isSco: false,
            dependencies: { certificationCpfService: certificationCpfServiceStub },
          });

        // then
        expect(certificationCandidateErrors).to.be.empty;
      });
    });

    context('when candidate parsed data is invalid', function () {
      it('should return an certificationCandidateErrors containing the specific error', async function () {
        // given
        const isSco = false;
        const candidate = _buildValidCandidateModel();
        candidate.firstName = null;
        const cpfBirthInformationValidation = new CpfBirthInformationValidation();
        cpfBirthInformationValidation.success({ ...candidate });
        const certificationCpfServiceStub = {
          getBirthInformation: sinon.stub().resolves(cpfBirthInformationValidation),
        };

        // when
        const { certificationCandidateErrors } =
          await sessionsImportValidationService.getValidatedCandidateBirthInformation({
            candidate,
            isSco,
            line: 1,
            dependencies: { certificationCpfService: certificationCpfServiceStub },
          });

        // then
        expect(certificationCandidateErrors).to.deep.equal([
          {
            code: 'CANDIDATE_FIRST_NAME_REQUIRED',
            line: 1,
            isBlocking: true,
          },
        ]);
      });
    });

    context("when candidate's extraTimePourcentage is below than 1", function () {
      it('should return a report', async function () {
        // given
        const isSco = false;
        const candidate = _buildValidCandidateModel();
        candidate.extraTimePercentage = 0.33;
        const cpfBirthInformationValidation = new CpfBirthInformationValidation();
        cpfBirthInformationValidation.success({ ...candidate });
        const certificationCpfServiceStub = {
          getBirthInformation: sinon.stub().resolves(cpfBirthInformationValidation),
        };

        // when
        const { certificationCandidateErrors } =
          await sessionsImportValidationService.getValidatedCandidateBirthInformation({
            candidate,
            isSco,
            line: 1,
            dependencies: { certificationCpfService: certificationCpfServiceStub },
          });

        // then
        expect(certificationCandidateErrors).to.deep.equal([
          {
            code: 'CANDIDATE_EXTRA_TIME_OUT_OF_RANGE',
            line: 1,
            isBlocking: true,
          },
        ]);
      });
    });

    context('when candidate has missing billing information', function () {
      context('when the parsed candidate is not sco', function () {
        context('when billing mode is null', function () {
          it('should return an certificationCandidateErrors containing billing mode errors', async function () {
            // given
            const isSco = false;
            const candidate = _buildValidCandidateModel();
            candidate.billingMode = null;
            const cpfBirthInformationValidation = new CpfBirthInformationValidation();
            cpfBirthInformationValidation.success({ ...candidate });
            const certificationCpfServiceStub = {
              getBirthInformation: sinon.stub().resolves(cpfBirthInformationValidation),
            };

            // when
            const { certificationCandidateErrors } =
              await sessionsImportValidationService.getValidatedCandidateBirthInformation({
                candidate,
                isSco,
                line: 1,
                dependencies: { certificationCpfService: certificationCpfServiceStub },
              });

            // then
            expect(certificationCandidateErrors).to.deep.equal([
              {
                code: 'CANDIDATE_BILLING_MODE_REQUIRED',
                line: 1,
                isBlocking: true,
              },
            ]);
          });
        });

        context('when billing mode is missing', function () {
          it('should return an certificationCandidateErrors containing billing mode errors', async function () {
            // given
            const isSco = false;
            const candidate = _buildValidCandidateModel();
            candidate.billingMode = '';
            const cpfBirthInformationValidation = new CpfBirthInformationValidation();
            cpfBirthInformationValidation.success({ ...candidate });
            const certificationCpfServiceStub = {
              getBirthInformation: sinon.stub().resolves(cpfBirthInformationValidation),
            };
            // when
            const { certificationCandidateErrors } =
              await sessionsImportValidationService.getValidatedCandidateBirthInformation({
                candidate,
                isSco,
                line: 1,
                dependencies: { certificationCpfService: certificationCpfServiceStub },
              });

            // then
            expect(certificationCandidateErrors).to.deep.equal([
              {
                code: 'CANDIDATE_BILLING_MODE_REQUIRED',
                line: 1,
                isBlocking: true,
              },
            ]);
          });
        });
      });

      context('when the parsed candidate is sco', function () {
        it('should return an empty certificationCandidateErrors', async function () {
          // given
          const isSco = true;
          const candidateInformation = {
            birthCountry: 'Pérou',
            birthCity: 'Pétaouchnok',
            birthPostalCode: '44329',
            birthINSEECode: '67890',
          };
          const candidate = _buildValidCandidateModel();
          candidate.billingMode = null;
          const cpfBirthInformationValidation = new CpfBirthInformationValidation();
          cpfBirthInformationValidation.success(candidateInformation);
          const certificationCpfServiceStub = {
            getBirthInformation: sinon.stub().resolves(cpfBirthInformationValidation),
          };

          // when
          const { certificationCandidateErrors } =
            await sessionsImportValidationService.getValidatedCandidateBirthInformation({
              candidate,
              isSco,
              dependencies: { certificationCpfService: certificationCpfServiceStub },
            });

          // then
          expect(certificationCandidateErrors).to.be.empty;
        });
      });
    });

    context('when the parsed candidate data has invalid CPF information', function () {
      context('when the error has already been raised by the validation', function () {
        it('should return the error once', async function () {
          // given
          const candidate = _buildValidCandidateModel({});
          candidate.birthCountry = '';
          const certificationCpfCountryRepository = Symbol();
          const certificationCpfCityRepository = Symbol();
          const certificationCandidateError = CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTH_COUNTRY_REQUIRED;
          const cpfBirthInformationValidation = new CpfBirthInformationValidation();
          cpfBirthInformationValidation.failure({ certificationCandidateError });
          const certificationCpfServiceStub = {
            getBirthInformation: sinon
              .stub()
              .withArgs({
                birthCountry: '',
                birthCity: candidate.birthCity,
                birthPostalCode: candidate.birthPostalCode,
                birthINSEECode: candidate.birthINSEECode,
                certificationCpfCountryRepository,
                certificationCpfCityRepository,
              })
              .resolves(cpfBirthInformationValidation),
          };

          // when
          const result = await sessionsImportValidationService.getValidatedCandidateBirthInformation({
            candidate,
            isSco: false,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
            line: 1,
            dependencies: { certificationCpfService: certificationCpfServiceStub },
          });

          // then
          expect(result.certificationCandidateErrors).to.deep.equal([
            { code: 'CANDIDATE_BIRTH_COUNTRY_REQUIRED', line: 1, isBlocking: true },
          ]);
        });
      });

      it('should return multiple certificationCandidateErrors that contains the incorrect CPF message', async function () {
        // given
        const candidate = _buildValidCandidateModel();
        const certificationCpfCountryRepository = Symbol();
        const certificationCpfCityRepository = Symbol();
        const certificationCandidateError = { code: 'CPF_INCORRECT', getMessage: noop };
        const certificationCandidateError2 = { code: 'CPF_INCORRECT 2', getMessage: noop };
        const cpfBirthInformationValidation = new CpfBirthInformationValidation();
        cpfBirthInformationValidation.failure({
          certificationCandidateError: certificationCandidateError,
        });
        cpfBirthInformationValidation.failure({ certificationCandidateError: certificationCandidateError2 });

        const certificationCpfServiceStub = {
          getBirthInformation: sinon
            .stub()
            .withArgs({
              birthCountry: candidate.birthCountry,
              birthCity: candidate.birthCity,
              birthPostalCode: candidate.birthPostalCode,
              birthINSEECode: candidate.birthINSEECode,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
            })
            .resolves(cpfBirthInformationValidation),
        };
        // when
        const result = await sessionsImportValidationService.getValidatedCandidateBirthInformation({
          candidate,
          isSco: false,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          line: 1,
          dependencies: { certificationCpfService: certificationCpfServiceStub },
        });

        // then
        expect(result.certificationCandidateErrors).to.deep.equal([
          { code: 'CPF_INCORRECT', line: 1, isBlocking: true },
          { code: 'CPF_INCORRECT 2', line: 1, isBlocking: true },
        ]);
      });
    });
  });

  describe('#getUniqueCandidates', function () {
    context('when there is no duplicate', function () {
      it('returns the list without errors', function () {
        // given
        const candidates = [
          _buildValidCandidateModel({ lineNumber: 1, candidateNumber: 97 }),
          _buildValidCandidateModel({ lineNumber: 2, candidateNumber: 98 }),
        ];

        // when
        const { uniqueCandidates, duplicateCandidateErrors } =
          sessionsImportValidationService.getUniqueCandidates(candidates);

        // then
        expect(uniqueCandidates.length).equals(candidates.length);
        expect(duplicateCandidateErrors).to.be.empty;
      });
    });
    context('when there are duplicates', function () {
      it('returns the filtered list with errors', function () {
        // given
        const candidates = [
          _buildValidCandidateModel({ lineNumber: 1, candidateNumber: 97 }),
          _buildValidCandidateModel({ lineNumber: 2, candidateNumber: 98 }),
          _buildValidCandidateModel({ lineNumber: 3, candidateNumber: 97 }),
        ];

        // when
        const { uniqueCandidates, duplicateCandidateErrors } =
          sessionsImportValidationService.getUniqueCandidates(candidates);

        // then
        expect(uniqueCandidates.map(({ lastName }) => lastName)).to.deep.equal(['Candidat 97', 'Candidat 98']);
        expect(duplicateCandidateErrors).to.deep.equal([
          {
            code: 'DUPLICATE_CANDIDATE_IN_SESSION',
            line: undefined,
            isBlocking: false,
          },
        ]);
      });
    });
  });
});

function _createValidSessionData() {
  return {
    sessionId: undefined,
    address: 'Site 1',
    room: 'Salle 1',
    date: '2023-03-12',
    time: '01:00',
    examiner: 'Pierre',
    description: 'desc',
    certificationCandidates: [],
  };
}

function _buildValidSessionWithId(sessionId) {
  return domainBuilder.certification.enrolment.buildSession({
    id: sessionId,
    address: null,
    room: null,
    date: null,
    time: null,
    examiner: null,
    description: null,
    certificationCandidates: [],
  });
}

function _buildValidSessionWithoutId() {
  return domainBuilder.certification.enrolment.buildSession({
    id: null,
    date: '2024-03-12',
    certificationCandidates: [],
  });
}

function _buildValidCandidateData({ lineNumber = 0, candidateNumber = 2 } = { candidateNumber: 0, lineNumber: 0 }) {
  return {
    lastName: `Candidat ${candidateNumber}`,
    firstName: `Candidat ${candidateNumber}`,
    birthdate: '1981-03-12',
    sex: 'M',
    birthINSEECode: '134',
    birthPostalCode: null, //'3456',
    birthCity: '',
    birthCountry: 'France',
    resultRecipientEmail: 'robindahood@email.fr',
    email: 'robindahood2@email.fr',
    externalId: 'htehte',
    extraTimePercentage: 20,
    billingMode: 'PAID',
    line: lineNumber,
    subscriptionLabels: [SUBSCRIPTION_TYPES.CORE],
    lineNumber,
    candidateNumber,
  };
}
function _buildValidCandidateModel({ lineNumber = 0, candidateNumber = 2 } = { candidateNumber: 0, lineNumber: 0 }) {
  return domainBuilder.certification.enrolment.buildCandidate({
    lastName: `Candidat ${candidateNumber}`,
    firstName: `Candidat ${candidateNumber}`,
    birthdate: '1981-03-12',
    sex: 'M',
    birthINSEECode: '134',
    birthPostalCode: null, //'3456',
    birthCity: '',
    birthCountry: 'France',
    resultRecipientEmail: 'robindahood@email.fr',
    email: 'robindahood2@email.fr',
    externalId: 'htehte',
    extraTimePercentage: 20,
    billingMode: 'PAID',
    line: lineNumber,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
  });
}
