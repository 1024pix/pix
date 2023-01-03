const { expect, catchErr, sinon } = require('../../../test-helper');
const createSessions = require('../../../../lib/domain/usecases/create-sessions');
const { EntityValidationError, ForbiddenAccess } = require('../../../../lib/domain/errors');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const Session = require('../../../../lib/domain/models/Session');
const createSession = require('../../../../lib/domain/usecases/create-session');

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
      it('should save the sessions', async function () {
        // given
        const sessionsToSave = [
          {
            address: 'Site 1',
            room: 'Salle 1',
            date: '2022-03-12',
            time: '01:00',
            examiner: 'Pierre',
            description: '',
          },
        ];

        userWithMemberships.hasAccessToCertificationCenter.withArgs(certificationCenterId).returns(true);
        certificationCenterRepository.get.withArgs(certificationCenterId).resolves({ name: certificationCenterName });
        userRepository.getWithCertificationCenterMemberships.withArgs(userId).returns(userWithMemberships);
        sessionRepository.saveSessions.resolves();
        sessionValidator.validate.returns();

        // when
        await createSessions({
          sessions: sessionsToSave,
          certificationCenterId,
          userId,
          certificationCenterRepository,
          sessionRepository,
          userRepository,
        });

        // then
        const expectedSessions = [
          new Session({
            ...sessionsToSave[0],
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
          sessions: sessionsToSave,
          certificationCenterRepository,
          sessionRepository,
          userRepository,
        });

        // then
        expect(error).to.be.instanceOf(ForbiddenAccess);
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
        sessions: sessionsToSave,
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
      const sessions = [];

      // when
      const err = await catchErr(createSessions)({ sessions, certificationCenterId });

      // then
      expect(err).to.be.instanceOf(UnprocessableEntityError);
    });
  });
});
