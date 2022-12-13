const { expect, catchErr, sinon } = require('../../../test-helper');
const createSessions = require('../../../../lib/domain/usecases/create-sessions');
const { EntityValidationError } = require('../../../../lib/domain/errors');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');
const sessionValidator = require('../../../../lib/domain/validators/session-validator');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const Session = require('../../../../lib/domain/models/Session');

describe('Unit | UseCase | create-sessions', function () {
  let accessCode;
  let certificationCenterId;
  let certificationCenterName;
  let certificationCenter;
  let certificationCenterRepository;
  let sessionRepository;

  beforeEach(function () {
    accessCode = 'accessCode';
    certificationCenterId = 'certificationCenterId';
    certificationCenterName = 'certificationCenterName';
    certificationCenter = { id: certificationCenterId, name: certificationCenterName };
    certificationCenterRepository = { get: sinon.stub() };
    sessionRepository = { saveSessions: sinon.stub() };
    sinon.stub(sessionValidator, 'validate');
    sinon.stub(sessionCodeService, 'getNewSessionCodeWithoutAvailabilityCheck');
    sessionCodeService.getNewSessionCodeWithoutAvailabilityCheck.returns(accessCode);
    certificationCenterRepository.get.withArgs(certificationCenterId).resolves({ name: certificationCenter.name });
  });

  context('when sessions are valid', function () {
    it('should save the sessions', async function () {
      // given
      const sessionsToSave = [{ certificationCenterId }];
      sessionRepository.saveSessions.resolves();
      sessionValidator.validate.returns();

      // when
      await createSessions({
        certificationCenterId,
        data: sessionsToSave,
        certificationCenterRepository,
        sessionRepository,
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

  context('when at least one of the sessions is not valid', function () {
    it('should throw an error', async function () {
      // given
      const sessionsToSave = [{ date: "Ceci n'est pas une date" }];
      sessionValidator.validate.throws();

      // when
      const err = await catchErr(createSessions)({
        data: sessionsToSave,
        certificationCenterId,
        certificationCenterRepository,
        sessionRepository,
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
