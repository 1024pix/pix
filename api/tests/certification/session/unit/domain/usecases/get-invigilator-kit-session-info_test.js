import { expect, sinon, domainBuilder, catchErr } from '../../../../../test-helper.js';
import { getInvigilatorKitSessionInfo } from '../../../../../../src/certification/session/domain/usecases/get-invigilator-kit-session-info.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../../src/shared/domain/errors.js';
import { SessionForInvigilatorKit } from '../../../../../../src/certification/session/domain/read-models/SessionForInvigilatorKit.js';

describe('Unit | UseCase | get-invigilator-kit-info', function () {
  describe('getInvigilatorKitSessionInfo', function () {
    context('when user has access to the session', function () {
      it('should return the session main info', async function () {
        // given
        const userId = 'dummyUserId';
        const sessionId = 'dummySessionId';
        const sessionForInvigilatorKitRepository = { get: sinon.stub() };
        const sessionForInvigilatorKit = domainBuilder.buildSessionForInvigilatorKit({
          id: 1000,
          examiner: 'Toto',
          address: '3 rue ketanou',
          room: '54',
          date: '2021-01-01',
          time: '10:53',
          invigilatorPassword: '12AB5',
          accessCode: '1B3DE6',
        });
        sessionForInvigilatorKitRepository.get.withArgs(sessionId).resolves(sessionForInvigilatorKit);
        const sessionRepository = { doesUserHaveCertificationCenterMembershipForSession: sinon.stub() };
        sessionRepository.doesUserHaveCertificationCenterMembershipForSession.resolves(true);

        // when
        const result = await getInvigilatorKitSessionInfo({
          userId,
          sessionId,
          sessionRepository,
          sessionForInvigilatorKitRepository,
        });

        // then
        expect(result).to.deepEqualInstance(
          new SessionForInvigilatorKit({
            id: 1000,
            examiner: 'Toto',
            address: '3 rue ketanou',
            room: '54',
            date: '2021-01-01',
            time: '10:53',
            invigilatorPassword: '12AB5',
            accessCode: '1B3DE6',
            version: 2,
          }),
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
        const error = await catchErr(getInvigilatorKitSessionInfo)({ userId, sessionId, sessionRepository });

        // then
        expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
      });
    });
  });
});
