import { SessionEnrolment } from '../../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { SessionMassImportReport } from '../../../../../../src/certification/enrolment/domain/models/SessionMassImportReport.js';
import { validateSessions } from '../../../../../../src/certification/enrolment/domain/usecases/validate-sessions.js';
import { SUBSCRIPTION_TYPES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { CERTIFICATION_SESSIONS_ERRORS } from '../../../../../../src/certification/shared/domain/constants/sessions-errors.js';
import { CpfBirthInformationValidation } from '../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import { CertificationCandidate } from '../../../../../../src/shared/domain/models/index.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

const userId = 1234;
const cachedValidatedSessionsKey = 'uuid';
const accessCode = 'accessCode';
const certificationCenterId = '123';
const certificationCenterName = 'certificationCenterName';
const cpfBirthInformation = {
  birthCountry: 'France',
  birthCity: '',
  birthPostalCode: null,
  birthINSEECode: '134',
};

describe('Unit | UseCase | sessions-mass-import | validate-sessions', function () {
  let i18n;
  let certificationCenter;
  let certificationCenterRepository;
  let certificationCourseRepository;
  let complementaryCertificationRepository;
  let sessionCodeService;
  let sessionsImportValidationService;
  let temporarySessionsStorageForMassImportService;
  let firstSession;
  let secondSession;
  let candidateData1;
  let candidateData2;

  beforeEach(function () {
    i18n = getI18n();
    certificationCenter = domainBuilder.buildCertificationCenter({
      id: certificationCenterId,
      name: certificationCenterName,
    });
    certificationCenterRepository = { get: sinon.stub() };
    certificationCenterRepository.get.withArgs({ id: certificationCenterId }).resolves(certificationCenter);
    certificationCourseRepository = sinon.stub();
    complementaryCertificationRepository = { getByLabel: sinon.stub() };
    sessionCodeService = { getNewSessionCode: sinon.stub().returns(accessCode) };

    sessionsImportValidationService = {
      getValidatedSubscriptionsForMassImport: sinon.stub(),
      getValidatedCandidateBirthInformation: sinon.stub(),
      validateSession: sinon.stub(),
      getUniqueCandidates: sinon.stub(),
      validateCandidateEmails: sinon.stub(),
    };
    temporarySessionsStorageForMassImportService = {
      save: sinon.stub(),
    };

    candidateData1 = {
      firstName: 'Popi',
      lastName: 'Doudou',
      birthCity: '',
      birthCountry: 'France',
      birthPostalCode: null,
      birthINSEECode: '134',
      birthProvinceCode: '11',
      sex: 'M',
      email: 'popidoudou@email.fr',
      resultRecipientEmail: 'popidoudou@email.fr',
      externalId: 'popi',
      birthdate: '1981-03-12',
      extraTimePercentage: '20',
      subscriptionLabels: [SUBSCRIPTION_TYPES.CORE],
      billingMode: 'Gratuite',
      prepaymentCode: 'PIX2024',
      sessionId: 1,
    };
    candidateData2 = {
      firstName: 'Lili',
      lastName: 'Souris',
      birthCity: '',
      birthCountry: 'France',
      birthPostalCode: null,
      birthINSEECode: '134',
      birthProvinceCode: '12',
      sex: 'F',
      email: 'lilisouris@email.fr',
      resultRecipientEmail: 'lilisouris@email.fr',
      externalId: 'souris',
      birthdate: '2003-07-04',
      extraTimePercentage: '20',
      subscriptionLabels: [SUBSCRIPTION_TYPES.CORE],
      billingMode: 'Gratuite',
      prepaymentCode: null,
      sessionId: 2,
    };
    firstSession = {
      address: 'Site 1',
      date: '2023-03-12',
      time: '01:00',
      examiner: 'Oscar',
      description: 'desc1',
      room: 'Salle 1',
      id: 1,
      sessionId: 1,
    };
    secondSession = {
      address: 'Site 2',
      date: '2023-03-23',
      time: '03:00',
      examiner: 'Lalou',
      description: 'desc2',
      room: 'Salle 2',
      id: 2,
      sessionId: 2,
    };
  });

  context('when sessions and candidates are valid', function () {
    it('return a sessions report', async function () {
      // given
      const candidate1 = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData1,
        id: null,
        createdAt: null,
        userId: null,
        billingMode: CertificationCandidate.BILLING_MODES.FREE,
        subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
      });
      const session1 = { ...firstSession, candidates: [candidateData1] };
      const candidate2 = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData2,
        id: null,
        createdAt: null,
        userId: null,
        billingMode: CertificationCandidate.BILLING_MODES.FREE,
        subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
      });
      const session2 = { ...secondSession, candidates: [candidateData2] };

      sessionsImportValidationService.getValidatedSubscriptionsForMassImport.resolves({
        certificationCandidateComplementaryErrors: [],
        subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
      });

      sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
        certificationCandidateErrors: [],
        cpfBirthInformation,
      });

      temporarySessionsStorageForMassImportService.save.resolves(cachedValidatedSessionsKey);

      sessionsImportValidationService.getUniqueCandidates.withArgs([candidateData1]).returns({
        uniqueCandidates: [candidateData1],
        duplicateCandidateErrors: [],
      });
      sessionsImportValidationService.getUniqueCandidates.withArgs([candidateData2]).returns({
        uniqueCandidates: [candidateData2],
        duplicateCandidateErrors: [],
      });

      const [expectedSession1, expectedSession2] = [
        domainBuilder.certification.enrolment.buildSession({
          ...firstSession,
          certificationCenterId,
          certificationCenter: certificationCenterName,
          accessCode,
          certificationCandidates: [candidate1],
        }),
        domainBuilder.certification.enrolment.buildSession({
          ...secondSession,
          certificationCenterId,
          certificationCenter: certificationCenterName,
          accessCode,
          certificationCandidates: [candidate2],
        }),
      ];

      // when
      const sessionsMassImportReport = await validateSessions({
        sessionsData: [session1, session2],
        userId,
        certificationCenterId,
        certificationCenterRepository,
        sessionCodeService,
        i18n,
        sessionsImportValidationService,
        temporarySessionsStorageForMassImportService,
      });

      // then
      expect(temporarySessionsStorageForMassImportService.save).to.have.been.calledWith({
        sessions: [
          sinon.match({
            ...expectedSession1,
            certificationCandidates: [candidate1],
            createdBy: undefined,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          }),
          sinon.match({
            ...expectedSession2,
            certificationCandidates: [candidate2],
            createdBy: undefined,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          }),
        ],
        userId,
      });

      expect(sessionsMassImportReport).to.deep.equal({
        cachedValidatedSessionsKey,
        sessionsCount: 2,
        sessionsWithoutCandidatesCount: 0,
        candidatesCount: 2,
        errorReports: [],
      });
    });

    context('when there is only sessionId and candidate information', function () {
      it('should validate the candidates in the session', async function () {
        // given
        const candidate1 = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData1,
          id: null,
          createdAt: null,
          userId: null,
          billingMode: CertificationCandidate.BILLING_MODES.FREE,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        });
        const session1 = { ...firstSession, candidates: [candidateData1] };
        const candidate2 = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData2,
          id: null,
          createdAt: null,
          userId: null,
          billingMode: CertificationCandidate.BILLING_MODES.FREE,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        });
        const candidateData3 = { ...candidateData2, lastName: 'Brun', firstName: 'Petit Ours' };
        const candidate3 = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData3,
          id: null,
          createdAt: null,
          userId: null,
          billingMode: CertificationCandidate.BILLING_MODES.FREE,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        });
        const session2 = { sessionId: 2, candidates: [candidateData2, candidateData3] };

        sessionsImportValidationService.getUniqueCandidates.withArgs([candidateData1]).returns({
          uniqueCandidates: [candidateData1],
          duplicateCandidateErrors: [],
        });
        sessionsImportValidationService.getUniqueCandidates.withArgs([candidateData2, candidateData3]).returns({
          uniqueCandidates: [candidateData2, candidateData3],
          duplicateCandidateErrors: [],
        });

        const cpfBirthInformationValidation1 = new CpfBirthInformationValidation();
        cpfBirthInformationValidation1.success({ ...candidate1 });
        const cpfBirthInformationValidation2 = new CpfBirthInformationValidation();
        cpfBirthInformationValidation2.success({ ...candidate2 });
        const cpfBirthInformationValidation3 = new CpfBirthInformationValidation();
        cpfBirthInformationValidation3.success({ ...candidate3 });
        sessionsImportValidationService.getValidatedCandidateBirthInformation
          .onFirstCall()
          .resolves({ certificationCandidateErrors: [], cpfBirthInformation: cpfBirthInformationValidation1 })
          .onSecondCall()
          .resolves({ certificationCandidateErrors: [], cpfBirthInformation: cpfBirthInformationValidation2 })
          .onThirdCall()
          .resolves({ certificationCandidateErrors: [], cpfBirthInformation: cpfBirthInformationValidation3 });

        sessionsImportValidationService.getValidatedSubscriptionsForMassImport.resolves({
          certificationCandidateComplementaryErrors: [],
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        });

        temporarySessionsStorageForMassImportService.save.resolves(cachedValidatedSessionsKey);

        // when
        const sessionsMassImportReport = await validateSessions({
          sessionsData: [session1, session2],
          userId,
          certificationCenterId,
          certificationCenterRepository,
          certificationCourseRepository,
          sessionCodeService,
          i18n,
          sessionsImportValidationService,
          temporarySessionsStorageForMassImportService,
        });

        // then
        const [expectedSession1, expectedSession2] = [
          new SessionEnrolment({
            ...session1,
            id: 1,
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            certificationCandidates: [candidate1],
          }),
          new SessionEnrolment({
            ...session2,
            id: 2,
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            certificationCandidates: [candidate2, candidate3],
          }),
        ];

        expect(temporarySessionsStorageForMassImportService.save).to.have.been.calledWith({
          sessions: [
            sinon.match({
              ...expectedSession1,
              certificationCandidates: [candidate1],
              createdBy: undefined,
              supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
            }),
            sinon.match({
              ...expectedSession2,
              certificationCandidates: [candidate2, candidate3],
              createdBy: undefined,
              supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
            }),
          ],
          userId,
        });

        expect(sessionsMassImportReport).to.deep.equal({
          cachedValidatedSessionsKey,
          sessionsCount: 2,
          sessionsWithoutCandidatesCount: 0,
          candidatesCount: 3,
          errorReports: [],
        });
      });
    });
  });

  context('when session or candidate information is not valid', function () {
    it('should not save in temporary storage', async function () {
      // given
      sessionsImportValidationService.getValidatedSubscriptionsForMassImport.resolves({
        certificationCandidateComplementaryErrors: [],
        subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
      });
      sessionsImportValidationService.validateSession.resolves([
        { code: 'Veuillez indiquer un nom de site.', isBlocking: true },
      ]);
      sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
        certificationCandidateErrors: [],
        cpfBirthInformation: {},
      });
      const sessionsData = [{ ...firstSession, candidates: [candidateData1], address: null }];

      sessionsImportValidationService.getUniqueCandidates.returns({
        uniqueCandidates: [candidateData1],
        duplicateCandidateErrors: [],
      });

      // when
      await validateSessions({
        sessionsData,
        certificationCenterId,
        certificationCenterRepository,
        sessionCodeService,
        i18n,
        sessionsImportValidationService,
      });

      // then
      expect(temporarySessionsStorageForMassImportService.save).to.not.have.been.called;
    });

    context('when at least one of the sessions is not valid', function () {
      it('should return sessionsMassImportReport', async function () {
        // given
        const sessionsData = [{ ...firstSession, candidates: [candidateData1], address: null }];

        sessionsImportValidationService.getValidatedSubscriptionsForMassImport.resolves({
          certificationCandidateComplementaryErrors: [],
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        });
        sessionsImportValidationService.validateSession.resolves(['Veuillez indiquer un nom de site.']);
        sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
          certificationCandidateErrors: ['lastName required'],
        });

        sessionsImportValidationService.getUniqueCandidates.returns({
          uniqueCandidates: [candidateData1],
          duplicateCandidateErrors: [],
        });

        // when
        const sessionsMassImportReport = await validateSessions({
          sessionsData,
          certificationCenterId,
          certificationCenterRepository,
          sessionCodeService,
          i18n,
          sessionsImportValidationService,
          temporarySessionsStorageForMassImportService,
        });

        // then
        expect(sessionsMassImportReport).to.deep.equal({
          cachedValidatedSessionsKey: undefined,
          sessionsCount: 1,
          sessionsWithoutCandidatesCount: 0,
          candidatesCount: 1,
          errorReports: ['Veuillez indiquer un nom de site.', 'lastName required'],
        });

        expect(complementaryCertificationRepository.getByLabel).to.not.have.been.called;
      });
    });

    context('when there is at least one duplicate candidate in a session', function () {
      it('should remove duplicate certification candidates from the session', async function () {
        // given
        const candidate1 = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData1,
          id: null,
          createdAt: null,
          userId: null,
          billingMode: CertificationCandidate.BILLING_MODES.FREE,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        });
        const candidate2 = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData2,
          id: null,
          createdAt: null,
          userId: null,
          billingMode: CertificationCandidate.BILLING_MODES.FREE,
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        });
        const sessionsData = [
          {
            ...firstSession,
            candidates: [{ ...candidateData1 }, { ...candidateData1 }, { ...candidateData2 }],
          },
        ];

        sessionsImportValidationService.getValidatedSubscriptionsForMassImport.resolves({
          certificationCandidateComplementaryErrors: [],
          complementaryCertification: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        });
        sessionsImportValidationService.validateSession.resolves([]);
        sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
          certificationCandidateErrors: [],
          cpfBirthInformation: {},
        });

        sessionsImportValidationService.getUniqueCandidates.returns({
          uniqueCandidates: [candidate1, candidate2],
          duplicateCandidateErrors: [
            {
              line: 3,
              code: CERTIFICATION_SESSIONS_ERRORS.DUPLICATE_CANDIDATE_IN_SESSION.code,
              isBlocking: false,
            },
          ],
        });

        certificationCenterRepository.get.withArgs({ id: certificationCenterId }).resolves(certificationCenter);

        // when
        const sessionsMassImportReport = await validateSessions({
          sessionsData,
          certificationCenterRepository,
          certificationCenterId,
          sessionCodeService,
          i18n,
          sessionsImportValidationService,
          temporarySessionsStorageForMassImportService,
        });

        // then
        expect(sessionsMassImportReport).to.deep.equal(
          new SessionMassImportReport({
            cachedValidatedSessionsKey: undefined,
            sessionsCount: 1,
            sessionsWithoutCandidatesCount: 0,
            candidatesCount: 2,
            errorReports: [
              {
                line: 3,
                code: CERTIFICATION_SESSIONS_ERRORS.DUPLICATE_CANDIDATE_IN_SESSION.code,
                isBlocking: false,
              },
            ],
          }),
        );
      });
    });

    context('when candidate recipient (or convocation) email is not valid', function () {
      it('should return sessionsMassImportReport', async function () {
        // given
        const brokenCandidateData2 = {
          ...candidateData2,
          resultRecipientEmail: 'invalidemail',
        };
        const sessionsData = [
          {
            ...firstSession,
            candidates: [candidateData1, brokenCandidateData2],
          },
        ];

        sessionsImportValidationService.getValidatedSubscriptionsForMassImport.resolves({
          certificationCandidateComplementaryErrors: [],
          subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
        });
        sessionsImportValidationService.validateSession.resolves([]);
        sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
          certificationCandidateErrors: [],
          cpfBirthInformation: {},
        });
        sessionsImportValidationService.validateCandidateEmails
          .onFirstCall()
          .returns([])
          .onSecondCall()
          .returns([
            {
              line: 2,
              code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
              isBlocking: true,
            },
          ]);
        sessionsImportValidationService.getUniqueCandidates.returns({
          uniqueCandidates: [candidateData1, brokenCandidateData2],
          duplicateCandidateErrors: [],
        });

        certificationCenterRepository.get.withArgs({ id: certificationCenterId }).resolves(certificationCenter);

        // when
        const sessionsMassImportReport = await validateSessions({
          sessionsData,
          certificationCenterRepository,
          certificationCenterId,
          sessionCodeService,
          i18n,
          sessionsImportValidationService,
          temporarySessionsStorageForMassImportService,
        });

        // then
        expect(sessionsMassImportReport).to.deep.equal(
          new SessionMassImportReport({
            cachedValidatedSessionsKey: undefined,
            sessionsCount: 1,
            sessionsWithoutCandidatesCount: 0,
            candidatesCount: 2,
            errorReports: [
              {
                line: 2,
                code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
                isBlocking: true,
              },
            ],
          }),
        );
      });
    });
  });
});
