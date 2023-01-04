const { expect, catchErr, sinon } = require('../../../test-helper');
const createSessions = require('../../../../lib/domain/usecases/create-sessions');
const { EntityValidationError } = require('../../../../lib/domain/errors');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');
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
    certificationCenterId = '123';
    certificationCenterName = 'certificationCenterName';
    certificationCenter = { id: certificationCenterId, name: certificationCenterName };
    certificationCenterRepository = { get: sinon.stub() };
    sessionRepository = { saveSessions: sinon.stub() };
    sinon.stub(sessionCodeService, 'getNewSessionCodeWithoutAvailabilityCheck');
    sessionCodeService.getNewSessionCodeWithoutAvailabilityCheck.returns(accessCode);
    certificationCenterRepository.get.withArgs(certificationCenterId).resolves({ name: certificationCenter.name });
  });

  context('when sessions are valid', function () {
    context('when user has certification center membership', function () {
      it('should save the sessions', async function () {
        // given
        const sessions = [
          {
            address: 'Site 1',
            room: 'Salle 1',
            date: '2022-03-12',
            time: '01:00',
            examiner: 'Pierre',
            description: '',
          },
        ];
        sessionRepository.saveSessions.resolves();

        // when
        await createSessions({
          sessions,
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
            supervisorPassword: sinon.match(/^[2346789BCDFGHJKMPQRTVWXY]{5}$/),
          }),
        ];

        expect(sessionRepository.saveSessions).to.have.been.calledWithExactly(expectedSessions);
      });
    });
  });

  context('when at least one of the sessions is not valid', function () {
    it('should throw an error', async function () {
      // given
      const sessions = [
        {
          address: null,
          room: 'Salle 1',
          date: '2022-03-12',
          time: '01:00',
          examiner: 'Pierre',
          description: '',
        },
      ];

      // when
      const err = await catchErr(createSessions)({
        sessions,
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
      const sessions = [];

      // when
      const err = await catchErr(createSessions)({ sessions, certificationCenterId });

      // then
      expect(err).to.be.instanceOf(UnprocessableEntityError);
    });
  });
});
