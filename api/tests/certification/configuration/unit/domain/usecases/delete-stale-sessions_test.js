import { deleteStaleSessions } from '../../../../../../src/certification/configuration/domain/usecases/delete-stale-sessions.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | delete-stale-sessions', function () {
  let sessionsRepository;

  beforeEach(function () {
    sessionsRepository = {
      findStaleV2Sessions: sinon.stub(),
      deleteStaleSession: sinon.stub(),
    };
  });

  it('should trigger stale sessions deletion', async function () {
    // given
    const centerId1 = 1;
    const centerId2 = 2;
    sessionsRepository.findStaleV2Sessions.resolves([centerId1]);
    sessionsRepository.findStaleV2Sessions.onCall(0).returns({
      sessionIds: [centerId1],
      pagination: {
        page: 1,
        pageCount: 2,
        pageSize: 1,
        rowCount: 2,
      },
    });
    sessionsRepository.findStaleV2Sessions.onCall(1).returns({
      sessionIds: [centerId2],
      pagination: {
        page: 2,
        pageCount: 2,
        pageSize: 1,
        rowCount: 2,
      },
    });
    sessionsRepository.findStaleV2Sessions.onCall(2).returns({
      sessionIds: [],
      pagination: {
        page: 3,
        pageCount: 2,
        pageSize: 1,
        rowCount: 2,
      },
    });
    sessionsRepository.deleteStaleSession.resolves();

    // when
    const numberOfSessions = await deleteStaleSessions({
      sessionsRepository,
    });

    // then
    expect(sessionsRepository.findStaleV2Sessions).to.have.been.calledThrice;
    expect(sessionsRepository.deleteStaleSession).to.have.been.calledTwice;
    expect(numberOfSessions).to.equal(2);
  });
});
