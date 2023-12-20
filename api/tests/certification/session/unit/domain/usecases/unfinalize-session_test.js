import { sinon, expect } from '../../../../../test-helper.js';
import { unfinalizeSession } from '../../../../../../src/certification/session/domain/usecases/unfinalize-session.js';
import { knex } from '../../../../../../db/knex-database-connection.js';

describe('Unit | UseCase | unfinalize-session', function () {
  let sessionRepository;
  let finalizedSessionRepository;

  it('should call repositories with transaction', async function () {
    // given
    sinon.stub(knex, 'transaction').callsFake((fn) => fn());

    sessionRepository = {
      unfinalize: sinon.stub(),
    };
    finalizedSessionRepository = {
      delete: sinon.stub(),
    };

    // when
    await unfinalizeSession({ sessionId: 99, sessionRepository, finalizedSessionRepository });

    // then
    expect(sessionRepository.unfinalize).to.have.been.calledWithMatch({
      sessionId: 99,
      domainTransaction: sinon.match.object,
    });

    expect(finalizedSessionRepository.delete).to.have.been.calledWithMatch({
      sessionId: 99,
      domainTransaction: sinon.match.object,
    });
  });
});
