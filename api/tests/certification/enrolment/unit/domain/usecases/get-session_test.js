import { getSession } from '../../../../../../src/certification/enrolment/domain/usecases/get-session.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-session', function () {
  let sessionRepository;

  beforeEach(function () {
    sessionRepository = {
      get: sinon.stub(),
    };
  });

  context('when the session exists', function () {
    it('should get the session', async function () {
      // given
      const sessionId = 123;
      const sessionToFind = domainBuilder.certification.enrolment.buildSession({ id: sessionId });
      sessionRepository.get.withArgs({ id: sessionId }).resolves(sessionToFind);

      // when
      const actualSession = await getSession({
        sessionId,
        sessionRepository,
      });

      // then
      expect(actualSession).to.deepEqualInstance(sessionToFind);
    });
  });
});
