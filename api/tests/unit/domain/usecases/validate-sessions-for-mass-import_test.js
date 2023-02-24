const { domainBuilder, expect, catchErr, sinon } = require('../../../test-helper');
const validateSessionsForMassImport = require('../../../../lib/domain/usecases/validate-sessions-for-mass-import');
const { InvalidCertificationCandidate } = require('../../../../lib/domain/errors');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const Session = require('../../../../lib/domain/models/Session');
const certificationCpfService = require('../../../../lib/domain/services/certification-cpf-service');
const sessionsImportValidationService = require('../../../../lib/domain/services/sessions-mass-import/sessions-import-validation-service');
const temporarySessionsStorageForMassImportService = require('../../../../lib/domain/services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service');
const { CpfBirthInformationValidation } = require('../../../../lib/domain/services/certification-cpf-service');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');

describe('Unit | UseCase | validate-sessions-for-mass-import', function () {
  let accessCode;
  let certificationCenterId;
  let certificationCenterName;
  let certificationCenter;
  let certificationCenterRepository;
  let certificationCandidateRepository;
  let sessionRepository;

  beforeEach(function () {
    accessCode = 'accessCode';
    certificationCenterId = '123';
    certificationCenterName = 'certificationCenterName';
    certificationCenter = domainBuilder.buildCertificationCenter({
      id: certificationCenterId,
      name: certificationCenterName,
    });
    certificationCenterRepository = { get: sinon.stub() };
    certificationCandidateRepository = { saveInSession: sinon.stub(), deleteBySessionId: sinon.stub() };
    sessionRepository = { save: sinon.stub(), isSessionExisting: sinon.stub() };
    sinon.stub(sessionCodeService, 'getNewSessionCode');
    sinon.stub(certificationCpfService, 'getBirthInformation');
    sessionCodeService.getNewSessionCode.returns(accessCode);
    certificationCenterRepository.get.withArgs(certificationCenterId).resolves(certificationCenter);
    sessionsImportValidationService.validateSession = sinon.stub();
    sessionsImportValidationService.getValidatedCandidateBirthInformation = sinon.stub();
    temporarySessionsStorageForMassImportService.save = sinon.stub();
  });

  context('when sessions are valid', function () {
    context('when user has certification center membership', function () {
      it('should validate every session one by one', async function () {
        // given
        const userId = 1234;
        const validSessionData = createValidSessionData();
        const sessions = [
          {
            ...validSessionData,
            room: 'Salle 1',
          },
          {
            ...validSessionData,
            room: 'Salle 2',
          },
        ];

        const expectedSessions = [
          new Session({
            ...sessions[0],
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          }),
          new Session({
            ...sessions[1],
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          }),
        ];

        // when
        await validateSessionsForMassImport({
          sessions,
          userId,
          certificationCenterId,
          certificationCenterRepository,
          sessionRepository,
        });

        // then
        expect(temporarySessionsStorageForMassImportService.save).to.have.been.calledOnceWith({
          sessions: expectedSessions,
          userId,
        });
      });
    });

    context('when there is only sessionId and candidate information', function () {
      it('should validate the candidates in the session', async function () {
        // given
        const candidate1 = createValidCandidateData(1);
        const userId = 1234;
        const sessions = [
          {
            sessionId: 1234,
            certificationCandidates: [candidate1],
          },
        ];

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
        ];

        const cpfBirthInformationValidation1 = CpfBirthInformationValidation.success({ ...candidate1 });
        sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves(cpfBirthInformationValidation1);

        // when
        await validateSessionsForMassImport({
          sessions,
          userId,
          certificationCenterId,
          certificationCenterRepository,
          certificationCandidateRepository,
          sessionRepository,
        });

        // then
        expect(temporarySessionsStorageForMassImportService.save).to.have.been.calledOnceWithExactly({
          sessions: expectedSessions,
          userId,
        });
      });
    });
  });
  context('when at least one of the sessions is not valid', function () {
    it('should throw an error', async function () {
      // given
      const validSessionData = createValidSessionData();

      const sessions = [
        {
          ...validSessionData,
          address: null,
        },
      ];

      sessionsImportValidationService.validateSession.rejects(new UnprocessableEntityError());

      // when
      const error = await catchErr(validateSessionsForMassImport)({
        sessions,
        certificationCenterId,
        certificationCenterRepository,
        sessionRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(UnprocessableEntityError);
    });
  });

  context('when at least one of the candidates is not valid', function () {
    it('should throw an error', async function () {
      // given
      const validSessionData = createValidSessionData();
      const candidate = createValidCandidateData();

      const sessions = [
        {
          ...validSessionData,
          certificationCandidates: [{ ...candidate, name: null }],
        },
      ];

      sessionsImportValidationService.getValidatedCandidateBirthInformation.rejects(
        new InvalidCertificationCandidate({ error: { key: '', why: '' } })
      );

      // when
      const error = await catchErr(validateSessionsForMassImport)({
        sessions,
        certificationCenterId,
        certificationCenterRepository,
        sessionRepository,
      });

      // then
      expect(error).to.be.an.instanceOf(InvalidCertificationCandidate);
    });
  });
});

function createValidSessionData() {
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

function createValidCandidateData(candidateNumber = 2) {
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
