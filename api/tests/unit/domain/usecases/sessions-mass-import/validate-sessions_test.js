import { domainBuilder, expect, sinon } from '../../../../test-helper.js';
import { validateSessions } from '../../../../../lib/domain/usecases/sessions-mass-import/validate-sessions.js';
import { Session } from '../../../../../src/certification/session/domain/models/Session.js';
import { CpfBirthInformationValidation } from '../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import { CertificationCandidate } from '../../../../../lib/domain/models/CertificationCandidate.js';
import { CERTIFICATION_SESSIONS_ERRORS } from '../../../../../lib/domain/constants/sessions-errors.js';
import { SessionMassImportReport } from '../../../../../lib/domain/models/SessionMassImportReport.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../lib/domain/constants/certification-candidates-errors.js';

describe('Unit | UseCase | sessions-mass-import | validate-sessions', function () {
  let accessCode;
  let certificationCenterId;
  let certificationCenterName;
  let certificationCenter;
  let certificationCenterRepository;
  let certificationCourseRepository;
  let complementaryCertificationRepository;
  // eslint-disable-next-line mocha/no-setup-in-describe
  const i18n = getI18n();
  let sessionCodeService;
  let sessionsImportValidationService;
  let temporarySessionsStorageForMassImportService;

  beforeEach(function () {
    accessCode = 'accessCode';
    certificationCenterId = '123';
    certificationCenterName = 'certificationCenterName';
    certificationCenter = domainBuilder.buildCertificationCenter({
      id: certificationCenterId,
      name: certificationCenterName,
    });
    certificationCenterRepository = { get: sinon.stub() };
    complementaryCertificationRepository = { getByLabel: sinon.stub() };
    certificationCourseRepository = sinon.stub();
    sessionCodeService = { getNewSessionCode: sinon.stub().returns(accessCode) };
    certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);

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
  });

  context('when sessions and candidates are valid', function () {
    it('return a sessions report', async function () {
      // given
      const userId = 1234;
      const cachedValidatedSessionsKey = 'uuid';
      const validSessionData = _createValidSessionData();
      const complementaryCertification = { id: 3, key: 'EDU_2ND_DEGRE', label: 'Pix+ Édu 2nd degré' };
      sessionsImportValidationService.getValidatedComplementaryCertificationForMassImport.resolves({
        certificationCandidateComplementaryErrors: [],
        complementaryCertification,
      });
      sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
        certificationCandidateErrors: [],
        cpfBirthInformation: {
          birthCountry: 'France',
          birthCity: '',
          birthPostalCode: null,
          birthINSEECode: '134',
        },
      });
      sessionsImportValidationService.validateCandidateEmails.resolves([]);

      const sessions = [
        {
          ...validSessionData,
          line: 2,
          room: 'Salle 1',
        },
        {
          ...validSessionData,
          line: 3,
          room: 'Salle 2',
        },
      ];

      sessionsImportValidationService.getUniqueCandidates.returns({
        uniqueCandidates: validSessionData.certificationCandidates,
        duplicateCandidateErrors: [],
      });

      temporarySessionsStorageForMassImportService.save.resolves(cachedValidatedSessionsKey);

      // when
      const sessionsMassImportReport = await validateSessions({
        sessions,
        userId,
        certificationCenterId,
        certificationCenterRepository,
        sessionCodeService,
        i18n,
        sessionsImportValidationService,
        temporarySessionsStorageForMassImportService,
      });

      // then
      const expectedSessions = [
        new Session({
          ...sessions[0],
          certificationCenterId,
          certificationCenter: certificationCenterName,
          accessCode,
          certificationCandidates: [
            new CertificationCandidate({
              sessionId: sessions[0].id,
              lastName: 'Candidat 2',
              firstName: 'Candidat 2',
              birthdate: '1981-03-12',
              sex: 'M',
              birthINSEECode: '134',
              birthPostalCode: null,
              birthCity: '',
              birthCountry: 'France',
              resultRecipientEmail: 'robindahood@email.fr',
              email: 'robindahood2@email.fr',
              externalId: 'htehte',
              extraTimePercentage: '20',
              billingMode: 'FREE',
              complementaryCertification,
            }),
          ],
          supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
        }),
        new Session({
          ...sessions[1],
          certificationCenterId,
          certificationCenter: certificationCenterName,
          accessCode,
          certificationCandidates: [
            new CertificationCandidate({
              sessionId: sessions[1].id,
              lastName: 'Candidat 2',
              firstName: 'Candidat 2',
              birthdate: '1981-03-12',
              sex: 'M',
              birthINSEECode: '134',
              birthPostalCode: null,
              birthCity: '',
              birthCountry: 'France',
              resultRecipientEmail: 'robindahood@email.fr',
              email: 'robindahood2@email.fr',
              externalId: 'htehte',
              extraTimePercentage: '20',
              billingMode: 'FREE',
              complementaryCertification,
            }),
          ],
          supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
        }),
      ];

      expect(temporarySessionsStorageForMassImportService.save).to.have.been.calledOnceWith({
        sessions: expectedSessions,
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
        const cachedValidatedSessionsKey = 'uuid';
        const candidate1 = _createValidCandidateData({ candidateNumber: 1 });
        const candidate2 = _createValidCandidateData({ candidateNumber: 2 });
        const candidate3 = _createValidCandidateData({ candidateNumber: 3 });
        const userId = 1234;
        const sessions = [
          {
            sessionId: 1234,
            certificationCandidates: [candidate1],
          },
          {
            sessionId: 1235,
            certificationCandidates: [candidate2, candidate3],
          },
        ];

        sessionsImportValidationService.getUniqueCandidates
          .onFirstCall()
          .returns({
            uniqueCandidates: [candidate1],
            duplicateCandidateErrors: [],
          })
          .onSecondCall()
          .returns({
            uniqueCandidates: [candidate2, candidate3],
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

        sessionsImportValidationService.getValidatedComplementaryCertificationForMassImport.resolves({
          certificationCandidateComplementaryErrors: [],
          complementaryCertification: null,
        });

        sessionsImportValidationService.validateCandidateEmails.resolves([]);
        temporarySessionsStorageForMassImportService.save.resolves(cachedValidatedSessionsKey);

        // when
        const sessionsMassImportReport = await validateSessions({
          sessions,
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
        const expectedSessions = [
          new Session({
            ...sessions[0],
            id: 1234,
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
            certificationCandidates: [
              new CertificationCandidate({ ...candidate1, sessionId: 1234, billingMode: 'FREE' }),
            ],
          }),
          new Session({
            ...sessions[1],
            id: 1235,
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
            certificationCandidates: [
              new CertificationCandidate({ ...candidate2, sessionId: 1235, billingMode: 'FREE' }),
              new CertificationCandidate({ ...candidate3, sessionId: 1235, billingMode: 'FREE' }),
            ],
          }),
        ];

        expect(temporarySessionsStorageForMassImportService.save).to.have.been.calledOnceWithExactly({
          sessions: expectedSessions,
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
      const validSessionData = _createValidSessionData();

      const sessions = [
        {
          ...validSessionData,
          address: null,
        },
      ];

      sessionsImportValidationService.getUniqueCandidates.returns({
        uniqueCandidates: validSessionData.certificationCandidates,
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
        const validSessionData = _createValidSessionData();
        const candidate = _createValidCandidateData();

        const sessions = [
          {
            ...validSessionData,
            address: null,
            certificationCandidates: [{ ...candidate, name: null }],
          },
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
          uniqueCandidates: validSessionData.certificationCandidates,
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
        const validSessionData = _createValidSessionData();
        const firstCandidate = _createValidCandidateData({ line: 1, candidateNumber: 1 });
        const firstCandidateDuplicate = _createValidCandidateData({ line: 3, candidateNumber: 1 });
        const secondCandidate = _createValidCandidateData({ line: 2, candidateNumber: 2 });

        const sessions = [
          {
            ...validSessionData,
            certificationCandidates: [firstCandidate, firstCandidateDuplicate, secondCandidate],
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
          uniqueCandidates: [firstCandidate, secondCandidate],
          duplicateCandidateErrors: [
            {
              line: 3,
              code: CERTIFICATION_SESSIONS_ERRORS.DUPLICATE_CANDIDATE_IN_SESSION.code,
              isBlocking: false,
            },
          ],
        });

        certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);

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
        const validSessionData = _createValidSessionData();
        const firstCandidate = _createValidCandidateData({ line: 1, candidateNumber: 1 });
        const secondCandidatewithInvalidEmail = {
          lastName: `Anne`,
          firstName: `Toine`,
          birthdate: '1981-03-12',
          sex: 'M',
          birthINSEECode: '134',
          birthPostalCode: null,
          birthCity: '',
          birthCountry: 'France',
          resultRecipientEmail: 'invalidemail',
          email: 'robindahood2@email.fr',
          externalId: 'htehte',
          extraTimePercentage: '20',
          billingMode: 'Gratuite',
          line: 2,
        };

        const sessions = [
          {
            ...validSessionData,
            certificationCandidates: [firstCandidate, secondCandidatewithInvalidEmail],
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
          uniqueCandidates: [firstCandidate, secondCandidatewithInvalidEmail],
          duplicateCandidateErrors: [],
        });

        certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);

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

function _createValidSessionData() {
  return {
    sessionId: undefined,
    address: 'Site 1',
    room: 'Salle 1',
    date: '2023-03-12',
    time: '01:00',
    examiner: 'Pierre',
    description: 'desc',
    certificationCandidates: [_createValidCandidateData()],
  };
}

function _createValidCandidateData({ line = 0, candidateNumber = 2 } = { line: 1, candidateNumber: 2 }) {
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
    extraTimePercentage: '20',
    billingMode: 'Gratuite',
    line,
  };
}
