const { expect, catchErr, sinon, domainBuilder } = require('../../../test-helper');
const createSessions = require('../../../../lib/domain/usecases/create-sessions');
const { EntityValidationError, ForbiddenAccess } = require('../../../../lib/domain/errors');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const Session = require('../../../../lib/domain/models/Session');
const createSession = require('../../../../lib/domain/usecases/create-session');
const certificationSessionsService = require('../../../../lib/domain/services/certification-sessions-service');

describe('Unit | UseCase | create-sessions', function () {
  let userId;
  let accessCode;
  let certificationCenterId;
  let certificationCenterName;
  let certificationCenter;
  let certificationCenterRepository;
  let sessionRepository;
  let userRepository;
  let userWithMemberships;

  beforeEach(function () {
    userId = 'userId';
    accessCode = 'accessCode';
    certificationCenterId = '123';
    certificationCenterName = 'certificationCenterName';
    certificationCenter = { id: certificationCenterId, name: certificationCenterName };
    certificationCenterRepository = { get: sinon.stub() };
    sessionRepository = { saveSessions: sinon.stub() };
    userRepository = { getWithCertificationCenterMemberships: sinon.stub() };
    userWithMemberships = { hasAccessToCertificationCenter: sinon.stub() };
    sinon.stub(sessionValidator, 'validate');
    sinon.stub(sessionCodeService, 'getNewSessionCodeWithoutAvailabilityCheck');
    sessionCodeService.getNewSessionCodeWithoutAvailabilityCheck.returns(accessCode);
    certificationCenterRepository.get.withArgs(certificationCenterId).resolves({ name: certificationCenter.name });
  });

  context('when sessions are valid', function () {
    context('when user has certification center membership', function () {
      it('should create the sessions', async function () {
        // given
        const sessionsToSave = [{ certificationCenterId }];
        userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
        userRepository.getWithCertificationCenterMemberships.withArgs(userId).returns(userWithMemberships);
        sessionRepository.saveSessions.resolves();
        sessionValidator.validate.returns();
        sinon.stub(certificationSessionsService, 'associateSessionIdToParsedData');
        certificationSessionsService.associateSessionIdToParsedData.returns([]);

        // when
        await createSessions({
          data: sessionsToSave,
          certificationCenterId,
          userId,
          certificationCenterRepository,
          sessionRepository,
          userRepository,
        });

        // then
        const expectedSessions = [
          new Session({
            certificationCenterId,
            certificationCenter: certificationCenterName,
            accessCode,
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          }),
        ];

        expect(sessionRepository.saveSessions).to.have.been.calledWithExactly(expectedSessions);
      });
    });

    context('when user has no certification center membership', function () {
      it('should throw a forbidden error', async function () {
        // given
        const sessionsToSave = [{ certificationCenterId }];
        userRepository.getWithCertificationCenterMemberships.withArgs(userId).returns(userWithMemberships);
        userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(false);

        // when
        const error = await catchErr(createSession)({
          userId,
          session: sessionsToSave,
          certificationCenterRepository,
          sessionRepository,
          userRepository,
        });

        // then
        expect(error).to.be.instanceOf(ForbiddenAccess);
      });
    });

    context('when candidates information is valid', function () {
      it('should not throw an error', async function () {
        // given
        const parsedCsvData = [
          {
            '* Nom du site': 'site1',
            '* Nom de la salle': 'salle1',
            '* Date de début': '2022-01-01',
            '* Heure de début (heure locale)': '01:00',
            '* Surveillant(s)': 'surveillant un',
            'Observations (optionnel)': 'non',
            ' * Nom de naissance': 'Man',
            '* Prénom': 'Iron',
            '* Date de naissance (format: jj/mm/aaaa)': '01/01/2000',
            '* Sexe (M ou F)': 'M',
            'Code Insee': '',
            'Code postal': '75015',
            'Nom de la commune': '',
            '* Pays': 'France',
            'E-mail du destinataire des résultats (formateur, enseignant…)': 'destinataire@email.com',
            'E-mail de convocation': 'convocation@email.com',
            'Identifiant local': '12345R',
            'Temps majoré ?': '10',
          },
        ];

        sessionRepository.saveSessions.resolves([
          domainBuilder.buildSession({
            id: 201,
            certificationCenterId: 101,
            certificationCenter: 'Centre avec un candidat',
            address: 'site1',
            room: 'salle1',
            examiner: 'surveillant un',
            date: '2022-01-01',
            time: '01:00',
            description: 'non',
          }),
        ]);

        // when
        const result = await createSessions({
          data: parsedCsvData,
          certificationCenterId,
          userId,
          certificationCenterRepository,
          sessionRepository,
          userRepository,
        });

        // then
        expect(result).not.to.throw;
      });
    });
  });

  context('when at least one of the sessions is not valid', function () {
    it('should throw an error', async function () {
      // given
      const sessionsToSave = [{ date: "Ceci n'est pas une date" }];
      userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
      userRepository.getWithCertificationCenterMemberships.withArgs(userId).returns(userWithMemberships);
      sessionValidator.validate.throws();

      // when
      const err = await catchErr(createSessions)({
        data: sessionsToSave,
        userId,
        certificationCenterId,
        certificationCenterRepository,
        sessionRepository,
        userRepository,
      });

      // then
      expect(err).to.be.instanceOf(EntityValidationError);
    });
  });

  context('when there is no session data', function () {
    it('should throw an error', async function () {
      // given
      const data = [];

      // when
      const err = await catchErr(createSessions)({ data, certificationCenterId });

      // then
      expect(err).to.be.instanceOf(UnprocessableEntityError);
    });
  });
});
