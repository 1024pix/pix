import { expect, sinon, domainBuilder } from '../../../../../test-helper.js';
import { getInvigilatorKitSessionInfo } from '../../../../../../src/certification/session/domain/usecases/get-invigilator-kit-session-info.js';
import { SessionForInvigilatorKit } from '../../../../../../src/certification/session/domain/read-models/SessionForInvigilatorKit.js';

describe('Unit | UseCase | get-invigilator-kit-info', function () {
  describe('getInvigilatorKitSessionInfo', function () {
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
});
