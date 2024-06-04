import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../lib/domain/constants/certification-candidates-errors.js';
import { CERTIFICATION_SESSIONS_ERRORS } from '../../../../../../lib/domain/constants/sessions-errors.js';
import { SessionEnrolment } from '../../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { SessionMassImportReport } from '../../../../../../src/certification/enrolment/domain/models/SessionMassImportReport.js';
import { CpfBirthInformationValidation } from '../../../../../../src/certification/enrolment/domain/services/certification-cpf-service.js';
import { validateSessions } from '../../../../../../src/certification/enrolment/domain/usecases/validate-sessions.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

const userId = 1234;
const cachedValidatedSessionsKey = 'uuid';
const accessCode = 'accessCode';
const certificationCenterId = '123';
const certificationCenterName = 'certificationCenterName';
const complementaryCertification = { id: 3, key: 'EDU_2ND_DEGRE', label: 'Pix+ Édu 2nd degré' };
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
  let candidate1;
  let candidate2;

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
      getValidatedComplementaryCertificationForMassImport: sinon.stub(),
      getValidatedCandidateBirthInformation: sinon.stub(),
      validateSession: sinon.stub(),
      getUniqueCandidates: sinon.stub(),
      validateCandidateEmails: sinon.stub(),
    };
    temporarySessionsStorageForMassImportService = {
      save: sinon.stub(),
    };

    candidate1 = {
      id: 123,
      firstName: 'Popi',
      lastName: 'Doudou',
      birthCity: '',
      birthCountry: 'France',
      birthPostalCode: null,
      birthINSEECode: '134',
      sex: 'M',
      email: 'popidoudou@email.fr',
      resultRecipientEmail: 'popidoudou@email.fr',
      externalId: 'popi',
      birthdate: '1981-03-12',
      extraTimePercentage: '20',
      subscriptions: [domainBuilder.buildCoreSubscription()],
      billingMode: 'Gratuite',
      sessionId: 1,
    };
    candidate2 = {
      id: 456,
      firstName: 'Lili',
      lastName: 'Souris',
      birthCity: '',
      birthCountry: 'France',
      birthPostalCode: null,
      birthINSEECode: '134',
      sex: 'F',
      email: 'lilisouris@email.fr',
      resultRecipientEmail: 'lilisouris@email.fr',
      externalId: 'souris',
      birthdate: '2003-07-04',
      extraTimePercentage: '20',
      subscriptions: [domainBuilder.buildCoreSubscription()],
      billingMode: 'Gratuite',
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
      const certificationCandidate1 = domainBuilder.buildCertificationCandidate({
        ...candidate1,
        complementaryCertification,
      });
      const session1 = { ...firstSession, certificationCandidates: [certificationCandidate1] };
      const certificationCandidate2 = domainBuilder.buildCertificationCandidate({
        ...candidate2,
        complementaryCertification,
      });
      const session2 = { ...secondSession, certificationCandidates: [certificationCandidate2] };

      sessionsImportValidationService.getValidatedComplementaryCertificationForMassImport.resolves({
        certificationCandidateComplementaryErrors: [],
        complementaryCertification,
      });

      sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
        certificationCandidateErrors: [],
        cpfBirthInformation,
      });

      temporarySessionsStorageForMassImportService.save.resolves(cachedValidatedSessionsKey);

      sessionsImportValidationService.getUniqueCandidates.withArgs([certificationCandidate1]).returns({
        uniqueCandidates: [certificationCandidate1],
        duplicateCandidateErrors: [],
      });
      sessionsImportValidationService.getUniqueCandidates.withArgs([certificationCandidate2]).returns({
        uniqueCandidates: [certificationCandidate2],
        duplicateCandidateErrors: [],
      });

      const [expectedSession1, expectedSession2] = [
        domainBuilder.certification.enrolment.buildSession({
          ...firstSession,
          certificationCenterId,
          certificationCenter: certificationCenterName,
          accessCode,
          certificationCandidates: [certificationCandidate1],
        }),
        domainBuilder.certification.enrolment.buildSession({
          ...secondSession,
          certificationCenterId,
          certificationCenter: certificationCenterName,
          accessCode,
          certificationCandidates: [certificationCandidate2],
        }),
      ];

      // when
      const sessionsMassImportReport = await validateSessions({
        sessions: [session1, session2],
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
            certificationCandidates: [
              sinon.match({
                ...certificationCandidate1,
                billingMode: 'FREE',
              }),
            ],
            createdBy: undefined,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          }),
          sinon.match({
            ...expectedSession2,
            certificationCandidates: [
              sinon.match({
                ...certificationCandidate2,
                billingMode: 'FREE',
              }),
            ],
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
        const certificationCandidate1 = domainBuilder.buildCertificationCandidate(candidate1);
        const session1 = { sessionId: 1, certificationCandidates: [certificationCandidate1] };
        const certificationCandidate2 = domainBuilder.buildCertificationCandidate(candidate2);
        const certificationCandidate3 = domainBuilder.buildCertificationCandidate({
          ...candidate2,
          lastName: 'Brun',
          firstName: 'Petit Ours',
        });
        const session2 = { sessionId: 2, certificationCandidates: [certificationCandidate2, certificationCandidate3] };

        sessionsImportValidationService.getUniqueCandidates.withArgs([certificationCandidate1]).returns({
          uniqueCandidates: [certificationCandidate1],
          duplicateCandidateErrors: [],
        });
        sessionsImportValidationService.getUniqueCandidates
          .withArgs([certificationCandidate2, certificationCandidate3])
          .returns({
            uniqueCandidates: [certificationCandidate2, certificationCandidate3],
            duplicateCandidateErrors: [],
          });

        const cpfBirthInformationValidation1 = new CpfBirthInformationValidation();
        cpfBirthInformationValidation1.success({ ...certificationCandidate1 });
        const cpfBirthInformationValidation2 = new CpfBirthInformationValidation();
        cpfBirthInformationValidation2.success({ ...certificationCandidate2 });
        const cpfBirthInformationValidation3 = new CpfBirthInformationValidation();
        cpfBirthInformationValidation3.success({ ...certificationCandidate3 });
        sessionsImportValidationService.getValidatedCandidateBirthInformation
          .onFirstCall()
          .resolves({ certificationCandidateErrors: [], cpfBirthInformation: cpfBirthInformationValidation1 })
          .onSecondCall()
          .resolves({ certificationCandidateErrors: [], cpfBirthInformation: cpfBirthInformationValidation2 })
          .onThirdCall()
          .resolves({ certificationCandidateErrors: [], cpfBirthInformation: cpfBirthInformationValidation3 });

        sessionsImportValidationService.getValidatedComplementaryCertificationForMassImport.resolves({
          certificationCandidateComplementaryErrors: [],
          complementaryCertification: null,
        });

        temporarySessionsStorageForMassImportService.save.resolves(cachedValidatedSessionsKey);

        // when
        const sessionsMassImportReport = await validateSessions({
          sessions: [session1, session2],
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
            certificationCandidates: [certificationCandidate1],
          }),
          new SessionEnrolment({
            ...session2,
            id: 2,
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            certificationCandidates: [certificationCandidate2, certificationCandidate3],
          }),
        ];

        expect(temporarySessionsStorageForMassImportService.save).to.have.been.calledWith({
          sessions: [
            sinon.match({
              ...expectedSession1,
              certificationCandidates: [
                sinon.match({
                  ...certificationCandidate1,
                  billingMode: 'FREE',
                }),
              ],
              createdBy: undefined,
              supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
            }),
            sinon.match({
              ...expectedSession2,
              certificationCandidates: [
                sinon.match({
                  ...certificationCandidate2,
                  billingMode: 'FREE',
                }),
                sinon.match({
                  ...certificationCandidate3,
                  billingMode: 'FREE',
                }),
              ],
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
      sessionsImportValidationService.getValidatedComplementaryCertificationForMassImport.resolves({
        certificationCandidateComplementaryErrors: [],
        complementaryCertification: null,
      });
      sessionsImportValidationService.validateSession.resolves([
        { code: 'Veuillez indiquer un nom de site.', isBlocking: true },
      ]);
      sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
        certificationCandidateErrors: [],
        cpfBirthInformation: {},
      });

      const certificationCandidate = domainBuilder.buildCertificationCandidate(candidate1);
      const sessions = [{ ...firstSession, certificationCandidates: [certificationCandidate], address: null }];

      sessionsImportValidationService.getUniqueCandidates.returns({
        uniqueCandidates: [certificationCandidate],
        duplicateCandidateErrors: [],
      });

      // when
      await validateSessions({
        sessions,
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
        const certificationCandidate = domainBuilder.buildCertificationCandidate(candidate1);
        const sessions = [
          { ...firstSession, certificationCandidates: [{ ...certificationCandidate, name: null }], address: null },
        ];

        sessionsImportValidationService.getValidatedComplementaryCertificationForMassImport.resolves({
          certificationCandidateComplementaryErrors: [],
          complementaryCertification: null,
        });
        sessionsImportValidationService.validateSession.resolves(['Veuillez indiquer un nom de site.']);
        sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
          certificationCandidateErrors: ['lastName required'],
        });

        sessionsImportValidationService.getUniqueCandidates.returns({
          uniqueCandidates: [certificationCandidate],
          duplicateCandidateErrors: [],
        });

        // when
        const sessionsMassImportReport = await validateSessions({
          sessions,
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
        const certificationCandidate1 = domainBuilder.buildCertificationCandidate({
          ...candidate1,
          line: 1,
          candidateNumber: 1,
        });
        const certificationCandidate1Duplicate = domainBuilder.buildCertificationCandidate({
          ...candidate1,
          line: 3,
          candidateNumber: 1,
        });
        const certificationCandidate2 = domainBuilder.buildCertificationCandidate({
          ...candidate2,
          line: 2,
          candidateNumber: 2,
        });
        const sessions = [
          {
            ...firstSession,
            certificationCandidates: [
              certificationCandidate1,
              certificationCandidate1Duplicate,
              certificationCandidate2,
            ],
          },
        ];

        sessionsImportValidationService.getValidatedComplementaryCertificationForMassImport.resolves({
          certificationCandidateComplementaryErrors: [],
          complementaryCertification: null,
        });
        sessionsImportValidationService.validateSession.resolves([]);
        sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
          certificationCandidateErrors: [],
          cpfBirthInformation: {},
        });

        sessionsImportValidationService.getUniqueCandidates.returns({
          uniqueCandidates: [certificationCandidate1, certificationCandidate2],
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
          sessions,
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
        const certificationCandidate = domainBuilder.buildCertificationCandidate(candidate1);
        const certificationCandidateWithInvalidEmail = domainBuilder.buildCertificationCandidate({
          ...candidate2,
          resultRecipientEmail: 'invalidemail',
        });
        const sessions = [
          {
            ...firstSession,
            certificationCandidates: [{ certificationCandidate, certificationCandidateWithInvalidEmail }],
          },
        ];

        sessionsImportValidationService.getValidatedComplementaryCertificationForMassImport.resolves({
          certificationCandidateComplementaryErrors: [],
          complementaryCertification: null,
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
          uniqueCandidates: [certificationCandidate, certificationCandidateWithInvalidEmail],
          duplicateCandidateErrors: [],
        });

        certificationCenterRepository.get.withArgs({ id: certificationCenterId }).resolves(certificationCenter);

        // when
        const sessionsMassImportReport = await validateSessions({
          sessions,
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
