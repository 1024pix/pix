import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import getSupervisorKitSessionInfo from '../../../../lib/domain/usecases/get-supervisor-kit-session-info';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors';
import SessionForSupervisorKit from '../../../../lib/domain/read-models/SessionForSupervisorKit';

describe('Unit | UseCase | get-supervisor-kit-main-info', function () {
  describe('getSupervisorKitSessionInfo', function () {
    context('when user has access to the session', function () {
      it('should return the session main info', async function () {
        // given
        const userId = 'dummyUserId';
        const sessionId = 'dummySessionId';
        const sessionForSupervisorKitRepository = { get: sinon.stub() };
        const sessionForSupervisorKit = domainBuilder.buildSessionForSupervisorKit({
          id: 1000,
          examiner: 'Toto',
          address: '3 rue ketanou',
          room: '54',
          date: '2021-01-01',
          time: '10:53',
          supervisorPassword: '12AB5',
          accessCode: '1B3DE6',
        });
        sessionForSupervisorKitRepository.get.withArgs(sessionId).resolves(sessionForSupervisorKit);
        const sessionRepository = { doesUserHaveCertificationCenterMembershipForSession: sinon.stub() };
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.resolves(true);

        // when
        const result = await getSupervisorKitSessionInfo({
          userId,
          sessionId,
          sessionRepository,
          sessionForSupervisorKitRepository,
        });

        // then
        expect(result).to.deepEqualInstance(
          new SessionForSupervisorKit({
            id: 1000,
            examiner: 'Toto',
            address: '3 rue ketanou',
            room: '54',
            date: '2021-01-01',
            time: '10:53',
            supervisorPassword: '12AB5',
            accessCode: '1B3DE6',
          })
        );
      });
    });

    context('when user does not have access to the session', function () {
      it('should return an error', async function () {
        // given
        const userId = 'dummyUserId';
        const sessionId = 'dummySessionId';
        const sessionRepository = { doesUserHaveCertificationCenterMembershipForSession: sinon.stub() };
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.resolves(false);

        // when
        const error = await catchErr(getSupervisorKitSessionInfo)({ userId, sessionId, sessionRepository });

        // then
        expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      });
    });
  });
});
