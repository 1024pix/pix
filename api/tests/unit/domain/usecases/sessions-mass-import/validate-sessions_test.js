const { domainBuilder, expect, sinon } = require('../../../../test-helper');
const validateSessions = require('../../../../../lib/domain/usecases/sessions-mass-import/validate-sessions');
const sessionCodeService = require('../../../../../lib/domain/services/session-code-service');
const Session = require('../../../../../lib/domain/models/Session');
const sessionsImportValidationService = require('../../../../../lib/domain/services/sessions-mass-import/sessions-import-validation-service');
const temporarySessionsStorageForMassImportService = require('../../../../../lib/domain/services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service');
const { CpfBirthInformationValidation } = require('../../../../../lib/domain/services/certification-cpf-service');
const CertificationCandidate = require('../../../../../lib/domain/models/CertificationCandidate');

describe('Unit | UseCase | sessions-mass-import | validate-sessions', function () {
  let accessCode;
  let certificationCenterId;
  let certificationCenterName;
  let certificationCenter;
  let certificationCenterRepository;
  let certificationCandidateRepository;
  let certificationCourseRepository;
  let sessionRepository;
  let complementaryCertificationRepository;

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
    sessionRepository = sinon.stub();
    sinon.stub(sessionCodeService, 'getNewSessionCode');
    sessionCodeService.getNewSessionCode.returns(accessCode);
    sessionsImportValidationService.getValidatedCandidateBirthInformation = sinon.stub();
    sessionsImportValidationService.validateSession = sinon.stub();
    temporarySessionsStorageForMassImportService.save = sinon.stub();
    certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);
  });

  context('when sessions and candidates are valid', function () {
    it('return a sessions report', async function () {
      // given
      const userId = 1234;
      const cachedValidatedSessionsKey = 'uuid';
      const validSessionData = _createValidSessionData();

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

      temporarySessionsStorageForMassImportService.save.resolves(cachedValidatedSessionsKey);

      // when
      const sessionsMassImportReport = await validateSessions({
        sessions,
        userId,
        certificationCenterId,
        certificationCenterRepository,
        sessionRepository,
      });

      // then
      const expectedSessions = [
        new Session({
          ...sessions[0],
          certificationCenterId,
          certificationCenter: certificationCenterName,
          accessCode,
          certificationCandidates: [],
          supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
        }),
        new Session({
          ...sessions[1],
          certificationCenterId,
          certificationCenter: certificationCenterName,
          accessCode,
          certificationCandidates: [],
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
        sessionsWithoutCandidatesCount: 2,
        candidatesCount: 0,
        blockingErrorReports: [],
        nonBlockingErrorReports: [
          {
            code: 'EMPTY_SESSION',
            line: 2,
          },
          {
            code: 'EMPTY_SESSION',
            line: 3,
          },
        ],
      });
    });

    context('when there is only sessionId and candidate information', function () {
      it('should validate the candidates in the session', async function () {
        // given
        const cachedValidatedSessionsKey = 'uuid';
        const candidate1 = _createValidCandidateData(1);
        const candidate2 = _createValidCandidateData(2);
        const candidate3 = _createValidCandidateData(3);
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

        const cpfBirthInformationValidation1 = CpfBirthInformationValidation.success({ ...candidate1 });
        const cpfBirthInformationValidation2 = CpfBirthInformationValidation.success({ ...candidate2 });
        const cpfBirthInformationValidation3 = CpfBirthInformationValidation.success({ ...candidate3 });
        sessionsImportValidationService.getValidatedCandidateBirthInformation
          .onCall(0)
          .resolves({ cpfBirthInformation: cpfBirthInformationValidation1 });
        sessionsImportValidationService.getValidatedCandidateBirthInformation
          .onCall(1)
          .resolves({ cpfBirthInformation: cpfBirthInformationValidation2 });
        sessionsImportValidationService.getValidatedCandidateBirthInformation
          .onCall(2)
          .resolves({ cpfBirthInformation: cpfBirthInformationValidation3 });

        temporarySessionsStorageForMassImportService.save.resolves(cachedValidatedSessionsKey);

        // when
        const sessionsMassImportReport = await validateSessions({
          sessions,
          userId,
          certificationCenterId,
          certificationCenterRepository,
          certificationCandidateRepository,
          certificationCourseRepository,
          sessionRepository,
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
          blockingErrorReports: [],
          nonBlockingErrorReports: [],
        });
      });
    });
  });

  context('when session or candidate information is not valid', function () {
    it('should not save in temporary storage', async function () {
      // given
      sessionsImportValidationService.validateSession.resolves(['Veuillez indiquer un nom de site.']);
      const validSessionData = _createValidSessionData();

      const sessions = [
        {
          ...validSessionData,
          address: null,
        },
      ];

      // when
      await validateSessions({
        sessions,
        certificationCenterId,
        certificationCenterRepository,
        sessionRepository,
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

        sessionsImportValidationService.validateSession.resolves(['Veuillez indiquer un nom de site.']);
        sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves({
          certificationCandidateErrors: ['lastName required'],
        });

        // when
        const sessionsMassImportReport = await validateSessions({
          sessions,
          certificationCenterId,
          certificationCenterRepository,
          sessionRepository,
        });

        // then
        expect(sessionsMassImportReport).to.deep.equal({
          cachedValidatedSessionsKey: undefined,
          sessionsCount: 1,
          sessionsWithoutCandidatesCount: 0,
          candidatesCount: 1,
          blockingErrorReports: ['Veuillez indiquer un nom de site.', 'lastName required'],
          nonBlockingErrorReports: [],
        });

        expect(complementaryCertificationRepository.getByLabel).to.not.have.been.called;
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

function _createValidCandidateData(candidateNumber = 2) {
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
  };
}
