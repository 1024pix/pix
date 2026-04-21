import sinon from 'sinon';

import { getJurySession } from '../../../../../../src/certification/session-management/domain/usecases/get-jury-session.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session Management | Unit | Domain | UseCase | get-jury-session', function () {
  let jurySessionRepository;

  beforeEach(function () {
    jurySessionRepository = {
      get: sinon.stub(),
    };
  });

  context('when the session exists', function () {
    it('should get the session', async function () {
      // given
      const sessionId = 123;
      const sessionToFind = domainBuilder.buildJurySession({ id: sessionId });
      jurySessionRepository.get.withArgs({ id: sessionId }).resolves(sessionToFind);

      // when
      const actualSession = await getJurySession({
        sessionId,
        jurySessionRepository,
      });

      // then
      expect(actualSession).to.deepEqualInstance(sessionToFind);
    });
  });

  context('when the session does not exist', function () {
    it('should throw an error the session', async function () {
      // given
      const sessionId = 123;
      jurySessionRepository.get.withArgs({ id: sessionId }).rejects(new NotFoundError());

      // when
      const err = await catchErr(getJurySession)({ sessionId, jurySessionRepository });

      // then
      expect(err).to.be.an.instanceof(NotFoundError);
    });
  });
});
