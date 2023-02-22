const { domainBuilder, expect, catchErr, sinon } = require('../../../test-helper');
const validateSessionsForMassImport = require('../../../../lib/domain/usecases/validate-sessions-for-mass-import');
const { InvalidCertificationCandidate } = require('../../../../lib/domain/errors');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const Session = require('../../../../lib/domain/models/Session');
const certificationCpfService = require('../../../../lib/domain/services/certification-cpf-service');
const sessionsImportValidationService = require('../../../../lib/domain/services/sessions-import-validation-service');
const { CpfBirthInformationValidation } = require('../../../../lib/domain/services/certification-cpf-service');
const _ = require('lodash');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');

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
  });

  context('when sessions are valid', function () {
    context('when user has certification center membership', function () {
      it('should validate every session one by one', async function () {
        // given
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
        const validatedSessions = await validateSessionsForMassImport({
          sessions,
          certificationCenterId,
          certificationCenterRepository,
          sessionRepository,
        });

        // then
        validatedSessions.forEach((session, index) => {
          expect(_.omit(session, 'supervisorPassword')).to.deep.equal(
            _.omit(expectedSessions[index], 'supervisorPassword')
          );
        });
      });

      context('when there is only sessionId and candidate information', function () {
        it('should validate the candidates in the session', async function () {
          // given
          const candidate1 = createValidCandidateData(1);
          const sessions = [
            {
              sessionId: 1234,
              certificationCandidates: [candidate1],
            },
          ];

          const expectedSessions = [
            {
              accessCode: 'accessCode',
              address: undefined,
              assignedCertificationOfficerId: undefined,
              certificationCenter: 'certificationCenterName',
              certificationCenterId: '123',
              date: undefined,
              description: undefined,
              examiner: undefined,
              examinerGlobalComment: undefined,
              finalizedAt: undefined,
              hasIncident: undefined,
              hasJoiningIssue: undefined,
              id: 1234,
              publishedAt: undefined,
              resultsSentToPrescriberAt: undefined,
              room: undefined,
              time: undefined,
              certificationCandidates: [
                {
                  authorizedToStart: undefined,
                  billingMode: 'FREE',
                  birthCity: '',
                  birthCountry: 'France',
                  birthINSEECode: '134',
                  birthPostalCode: null,
                  birthProvinceCode: undefined,
                  birthdate: '1981-03-12',
                  complementaryCertifications: [],
                  createdAt: undefined,
                  email: 'robindahood2@email.fr',
                  externalId: 'htehte',
                  extraTimePercentage: 20,
                  firstName: 'Candidat 1',
                  id: undefined,
                  lastName: 'Candidat 1',
                  organizationLearnerId: null,
                  prepaymentCode: null,
                  resultRecipientEmail: 'robindahood@email.fr',
                  sessionId: 1234,
                  sex: 'M',
                  userId: undefined,
                },
              ],
            },
          ];

          const cpfBirthInformationValidation1 = CpfBirthInformationValidation.success({ ...candidate1 });
          sessionsImportValidationService.getValidatedCandidateBirthInformation.resolves(
            cpfBirthInformationValidation1
          );

          // when
          const validatedSessions = await validateSessionsForMassImport({
            sessions,
            certificationCenterId,
            certificationCenterRepository,
            certificationCandidateRepository,
            sessionRepository,
          });

          // then
          validatedSessions.forEach((session, index) => {
            expect(_.omit(session, 'supervisorPassword')).to.deep.equal(
              _.omit(expectedSessions[index], 'supervisorPassword')
            );
          });
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
