import { InvigilatorSession } from '../../../../../../src/certification/session-management/domain/read-models/InvigilatorSession.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Session | Domain | Models | InvigilatorSession', function () {
  context('#isNotJoinable', function () {
    it(`returns false when the session doesn't have finalized date`, function () {
      const invigilatorSession = new InvigilatorSession({ finalizedAt: null });
      expect(invigilatorSession.isNotJoinable).to.be.false;
    });

    it('returns true when the session has finalized date', function () {
      const invigilatorSession = new InvigilatorSession({
        finalizedAt: new Date(),
      });
      expect(invigilatorSession.isNotJoinable).to.be.true;
    });
  });

  context('#checkPassword', function () {
    it('should return true when the invigilator password match', function () {
      // given
      const invigilatorSession = new InvigilatorSession({ invigilatorPassword: 'MATCHING-INVIGILATOR_PASSWORD' });

      // when
      const checkPassword = invigilatorSession.checkPassword('MATCHING-INVIGILATOR_PASSWORD');

      // then
      expect(checkPassword).to.be.true;
    });

    it('should return false when the invigilator password does not match', function () {
      // given
      const invigilatorSession = new InvigilatorSession({ invigilatorPassword: 'MATCHING-INVIGILATOR_PASSWORD' });

      // when
      const checkPassword = invigilatorSession.checkPassword('NOT_MATCHING-INVIGILATOR_PASSWORD');

      // then
      expect(checkPassword).to.be.false;
    });
  });
});
