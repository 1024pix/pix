import { getSessionForSupervising } from '../../../../../../src/certification/session-management/domain/usecases/get-session-for-supervising.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-session-for-supervising', function () {
  it('should call the repository', async function () {
    // given
    const sessionForSupervising = domainBuilder.buildSessionForSupervising();
    const sessionForSupervisingRepository = { get: sinon.stub() };
    sessionForSupervisingRepository.get.withArgs({ id: 1 }).resolves();

    // when
    const returnedSessionForSupervising = await getSessionForSupervising({
      sessionId: 1,
      sessionForSupervisingRepository,
    });
    // then
    expect(sessionForSupervising).to.equal(returnedSessionForSupervising);
  });
});
