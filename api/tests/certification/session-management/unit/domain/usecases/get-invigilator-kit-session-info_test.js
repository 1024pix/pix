import sinon from 'sinon';

import { SessionForInvigilatorKit } from '../../../../../../src/certification/session-management/domain/read-models/SessionForInvigilatorKit.js';
import { getInvigilatorKitSessionInfo } from '../../../../../../src/certification/session-management/domain/usecases/get-invigilator-kit-session-info.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

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
        invigilatorPassword: '12AB5E',
        accessCode: '1B3DE6',
      });
      sessionForInvigilatorKitRepository.get.withArgs({ id: sessionId }).resolves(sessionForInvigilatorKit);
      const sessionManagementRepository = { doesUserHaveCertificationCenterMembershipForSession: sinon.stub() };
      sessionManagementRepository.doesUserHaveCertificationCenterMembershipForSession.resolves(true);

      // when
      const result = await getInvigilatorKitSessionInfo({
        userId,
        sessionId,
        sessionManagementRepository,
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
          invigilatorPassword: '12AB5E',
          accessCode: '1B3DE6',
          version: 2,
        }),
      );
    });
  });
});
